import { LLMError, streamLLM } from '@/lib/llm'
import {
  buildAnalysisPrompt,
  type AnalyseRequest,
  type ResumeCompact,
} from '@/lib/tailor/prompts/tailorAnalysis'

export const runtime = 'nodejs'

function badRequest(message: string) {
  return Response.json({ error: 'invalid-request', message }, { status: 400 })
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function validate(body: unknown): AnalyseRequest | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Body must be a JSON object.' }
  const r = body as Partial<AnalyseRequest>

  if (typeof r.jdText !== 'string') return { error: '`jdText` must be a string.' }
  const jdText = r.jdText.trim()
  if (jdText.length < 1 || jdText.length > 20000) {
    return { error: '`jdText` must be 1–20,000 characters after trim.' }
  }

  if (!r.activeResume || typeof r.activeResume !== 'object') {
    return { error: '`activeResume` is required.' }
  }
  const ar = r.activeResume as Partial<ResumeCompact>
  if (!ar.header || typeof ar.header.name !== 'string') {
    return { error: '`activeResume.header.name` is required.' }
  }
  if (!Array.isArray(ar.experience)) {
    return { error: '`activeResume.experience` must be an array.' }
  }
  if (ar.experience.length > 25) {
    return { error: '`activeResume.experience` length must be ≤ 25.' }
  }
  let totalBullets = 0
  for (const exp of ar.experience) {
    if (!exp || typeof exp !== 'object') return { error: 'Each experience entry must be an object.' }
    if (!isStringArray(exp.bulletsFlat)) {
      return { error: '`experience[i].bulletsFlat` must be an array of strings.' }
    }
    totalBullets += exp.bulletsFlat.length
  }
  if (totalBullets > 200) {
    return { error: 'Total bullets across experience must be ≤ 200.' }
  }
  if (!isStringArray(ar.skillsFlat)) {
    return { error: '`skillsFlat` must be an array of strings.' }
  }
  if (!Array.isArray(ar.projectsFlat)) {
    return { error: '`projectsFlat` must be an array.' }
  }

  if (!r.diff || typeof r.diff !== 'object') return { error: '`diff` is required.' }
  const d = r.diff
  if (!isStringArray(d.presentKeywords) || !isStringArray(d.missingKeywords)) {
    return { error: '`diff.presentKeywords` and `diff.missingKeywords` must be string arrays.' }
  }
  if (d.presentKeywords.length + d.missingKeywords.length > 200) {
    return { error: '`diff` total keyword count must be ≤ 200.' }
  }

  return {
    jdText,
    activeResume: ar as ResumeCompact,
    diff: {
      presentKeywords: d.presentKeywords,
      missingKeywords: d.missingKeywords,
    },
    retryStrict: r.retryStrict === true,
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

  const prompt = buildAnalysisPrompt(result)

  let handle
  try {
    handle = await streamLLM(prompt)
  } catch (err) {
    if (err instanceof LLMError) {
      return Response.json(
        { error: 'provider-unavailable', provider: err.provider, message: err.message },
        { status: 503 },
      )
    }
    return Response.json(
      { error: 'unknown', message: err instanceof Error ? err.message : 'Unknown error' },
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
