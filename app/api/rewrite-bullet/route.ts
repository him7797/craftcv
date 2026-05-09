import { LLMError, streamLLM } from '@/lib/llm'
import { buildRewritePrompt, type RewriteRequest } from '@/lib/editor/prompts/rewriteBullet'

export const runtime = 'nodejs'

function badRequest(message: string) {
  return Response.json({ error: 'invalid-request', message }, { status: 400 })
}

function validate(body: unknown): RewriteRequest | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Body must be a JSON object.' }
  const r = body as Partial<RewriteRequest>
  if (typeof r.rough !== 'string') return { error: '`rough` must be a string.' }
  const rough = r.rough.trim()
  if (rough.length < 1 || rough.length > 500) {
    return { error: '`rough` must be 1–500 characters after trim.' }
  }
  const ctx = r.context ?? {}
  if (ctx.tech && (!Array.isArray(ctx.tech) || ctx.tech.length > 12)) {
    return { error: '`context.tech` must be an array of ≤ 12 strings.' }
  }
  if (
    ctx.siblingBullets &&
    (!Array.isArray(ctx.siblingBullets) || ctx.siblingBullets.length > 3)
  ) {
    return { error: '`context.siblingBullets` must be an array of ≤ 3 strings.' }
  }
  if (
    r.retryHint &&
    !['different-angle', 'shorter', 'add-metric'].includes(r.retryHint)
  ) {
    return { error: '`retryHint` must be one of: different-angle, shorter, add-metric.' }
  }
  return {
    rough,
    context: {
      role: typeof ctx.role === 'string' ? ctx.role : undefined,
      company: typeof ctx.company === 'string' ? ctx.company : undefined,
      tech: ctx.tech,
      siblingBullets: ctx.siblingBullets,
    },
    retryHint: r.retryHint,
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body must be valid JSON.')
  }

  const result = validate(body)
  if ('error' in result) return badRequest(result.error)

  const prompt = buildRewritePrompt(result)

  let handle
  try {
    handle = await streamLLM(prompt)
  } catch (err) {
    if (err instanceof LLMError) {
      return Response.json(
        { error: 'provider-unreachable', provider: err.provider, message: err.message },
        { status: 502 },
      )
    }
    return Response.json(
      { error: 'internal', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }

  const encoder = new TextEncoder()
  const iterator = handle.stream[Symbol.asyncIterator]()

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next()
        if (done) {
          controller.close()
          return
        }
        if (typeof value === 'string' && value.length > 0) {
          controller.enqueue(encoder.encode(value))
        }
      } catch {
        // Mid-stream error — close cleanly per contract §3
        controller.close()
      }
    },
    async cancel() {
      try {
        await iterator.return?.()
      } catch {
        /* ignore */
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-LLM-Provider': handle.provider,
      'X-LLM-Model': handle.model,
    },
  })
}
