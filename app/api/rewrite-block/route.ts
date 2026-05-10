import { LLMError, callLLM } from '@/lib/llm'
import { buildRewriteBlockPrompt, type RewriteBlockRequest } from '@/lib/editor/prompts/rewriteBlock'
import { checkBannedPhrases } from '@/lib/ai/validators/bannedPhrases'
import { checkHallucination } from '@/lib/ai/validators/hallucinationCheck'
import type { BlockType, RewriteResult, Resume, RetryHint } from '@/lib/types'

export const runtime = 'nodejs'

function badRequest(message: string) {
  return Response.json({ error: 'invalid-request', message }, { status: 400 })
}

const VALID_BLOCK_TYPES: BlockType[] = [
  'experience-description',
  'project-block',
  'experience-bullets',
  'skills-section',
]

const VALID_RETRY_HINTS: RetryHint[] = [
  'different-angle',
  'shorter',
  'more-metrics',
  'less-jargon',
  'simpler-language',
]

function validate(body: unknown): RewriteBlockRequest | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Body must be a JSON object.' }
  const r = body as Partial<RewriteBlockRequest>
  if (!r.blockType || !VALID_BLOCK_TYPES.includes(r.blockType)) {
    return { error: `blockType must be one of: ${VALID_BLOCK_TYPES.join(', ')}` }
  }
  if (!r.blockContent || typeof r.blockContent !== 'object') {
    return { error: 'blockContent must be an object.' }
  }
  if (!r.resumeContext || typeof r.resumeContext !== 'object') {
    return { error: 'resumeContext must be an object.' }
  }
  if (r.retryHint && !VALID_RETRY_HINTS.includes(r.retryHint)) {
    return { error: `retryHint must be one of: ${VALID_RETRY_HINTS.join(', ')}` }
  }
  return r as RewriteBlockRequest
}

function encodeEvent(obj: unknown): string {
  return JSON.stringify(obj) + '\n'
}

async function tryRewrite(
  req: RewriteBlockRequest,
  retryHint?: RetryHint,
): Promise<{ result: RewriteResult; warning?: boolean } | { error: string }> {
  const modifiedReq = retryHint ? { ...req, retryHint } : req
  const prompt = buildRewriteBlockPrompt(modifiedReq)

  let raw: string
  try {
    raw = await callLLM(prompt)
  } catch (err) {
    if (err instanceof LLMError) {
      return { error: `AI provider unavailable: ${err.message}` }
    }
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }

  let parsed: RewriteResult
  try {
    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/^```[\w]*\n?/m, '').replace(/\n?```$/m, '').trim()
    parsed = JSON.parse(cleaned) as RewriteResult
  } catch {
    return { error: 'AI returned invalid JSON. Please retry.' }
  }

  if (!parsed.before || !parsed.after || !parsed.diff) {
    return { error: 'AI response missing required fields. Please retry.' }
  }

  return { result: parsed }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body must be valid JSON.')
  }

  const validated = validate(body)
  if ('error' in validated) return badRequest(validated.error)

  const masterResume = (validated.resumeContext as unknown as { _masterResume?: Resume })
    ._masterResume

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(obj: unknown) {
        controller.enqueue(encoder.encode(encodeEvent(obj)))
      }

      let attempt = await tryRewrite(validated)

      if ('error' in attempt) {
        send({ type: 'error', message: attempt.error })
        controller.close()
        return
      }

      // Banned phrase check
      const bannedPhrase = checkBannedPhrases(attempt.result.after)
      if (bannedPhrase) {
        send({ type: 'retry', reason: 'banned-phrase' })
        attempt = await tryRewrite(validated, 'different-angle')
        if ('error' in attempt) {
          send({ type: 'error', message: attempt.error })
          controller.close()
          return
        }
      }

      // Hallucination check (only if master resume available)
      if (masterResume) {
        const hallucinatedTerm = checkHallucination(
          attempt.result.after,
          attempt.result.before,
          masterResume,
        )
        if (hallucinatedTerm) {
          send({ type: 'retry', reason: 'hallucination' })
          attempt = await tryRewrite(validated, 'simpler-language')
          if ('error' in attempt) {
            send({ type: 'error', message: attempt.error })
            controller.close()
            return
          }
          // If still hallucinating after retry, add warning flag
          const stillHallucinating = checkHallucination(
            attempt.result.after,
            attempt.result.before,
            masterResume,
          )
          if (stillHallucinating) {
            attempt.result.warning = 'may-not-match-guidelines'
          }
        }
      }

      // Second banned-phrase check after retries
      const stillBanned = checkBannedPhrases(attempt.result.after)
      if (stillBanned) {
        attempt.result.warning = 'may-not-match-guidelines'
      }

      send({ type: 'done', result: attempt.result })
      controller.close()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
