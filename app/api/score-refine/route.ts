import { LLMError, callLLM } from '@/lib/llm'
import { buildRefinePrompt, type ScoreRefineRequest } from '@/lib/score/prompts/scoreRefinement'

export const runtime = 'nodejs'

function badRequest(message: string) {
  return Response.json({ error: 'invalid-request', message }, { status: 400 })
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function validate(body: unknown): ScoreRefineRequest | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Body must be a JSON object.' }
  const r = body as Partial<ScoreRefineRequest>

  if (!r.resumeCompact || typeof r.resumeCompact !== 'object') {
    return { error: '`resumeCompact` is required.' }
  }
  if (!r.subscoresPre || typeof r.subscoresPre !== 'object') {
    return { error: '`subscoresPre` is required.' }
  }
  for (const key of ['impact', 'language', 'tailoring', 'format', 'length'] as const) {
    const v = (r.subscoresPre as Record<string, unknown>)[key]
    if (typeof v !== 'number' || v < 0 || v > 100) {
      return { error: `subscoresPre.${key} must be a number in [0,100].` }
    }
  }
  if (!Array.isArray(r.issues)) return { error: '`issues` must be an array.' }
  if (r.issues.length > 50) return { error: '`issues.length` must be ≤ 50.' }
  for (const iss of r.issues) {
    if (!iss || typeof iss !== 'object') return { error: 'Each issue must be an object.' }
    const i = iss as { id?: unknown; axis?: unknown; title?: unknown; state?: unknown; scoreImpact?: unknown }
    if (typeof i.id !== 'string' || typeof i.title !== 'string') {
      return { error: 'Each issue requires id and title strings.' }
    }
    if (i.state !== 'open' && i.state !== 'resolved') {
      return { error: 'issue.state must be "open" or "resolved".' }
    }
    if (typeof i.scoreImpact !== 'number') return { error: 'issue.scoreImpact must be a number.' }
  }
  if (!['NEEDS WORK', 'OK', 'GOOD', 'GREAT'].includes(r.band as string)) {
    return { error: 'band must be one of NEEDS WORK | OK | GOOD | GREAT.' }
  }
  // light validation of resumeCompact internals
  const ar = r.resumeCompact as { header?: { name?: unknown }; experience?: unknown; skillsFlat?: unknown; projectsFlat?: unknown }
  if (!ar.header || typeof ar.header.name !== 'string') {
    return { error: '`resumeCompact.header.name` is required.' }
  }
  if (!Array.isArray(ar.experience)) return { error: '`resumeCompact.experience` must be an array.' }
  if (!isStringArray(ar.skillsFlat)) return { error: '`resumeCompact.skillsFlat` must be string[].' }
  if (!Array.isArray(ar.projectsFlat)) return { error: '`resumeCompact.projectsFlat` must be an array.' }

  return r as ScoreRefineRequest
}

function extractJsonObject(text: string): string | null {
  let start = -1
  let depth = 0
  let inStr = false
  let escape = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (inStr) {
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === '"') inStr = false
      continue
    }
    if (ch === '"') {
      inStr = true
      continue
    }
    if (ch === '{') {
      if (start < 0) start = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && start >= 0) return text.slice(start, i + 1)
    }
  }
  return null
}

async function callAndParse(prompt: string) {
  const provider = process.env.LLM_PROVIDER ?? 'ollama'
  const raw = await callLLM(prompt)
  const json = extractJsonObject(raw)
  if (!json) throw new Error('No JSON object found in model output')
  const parsed = JSON.parse(json) as {
    languageDelta?: number
    verdictText?: string
    explanations?: Record<string, string>
  }
  return {
    languageDelta: typeof parsed.languageDelta === 'number' ? parsed.languageDelta : 0,
    verdictText: typeof parsed.verdictText === 'string' ? parsed.verdictText : '',
    explanations:
      parsed.explanations && typeof parsed.explanations === 'object' ? parsed.explanations : {},
    provider,
  }
}

function modelLabelFor(provider: string): string {
  if (provider === 'groq') return process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'
  if (provider === 'gemini') return process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'
  return process.env.OLLAMA_SCORE_MODEL ?? 'qwen2.5:7b'
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

  const provider = (process.env.LLM_PROVIDER ?? 'ollama') as 'ollama' | 'groq' | 'gemini'
  const model = modelLabelFor(provider)

  const firstPrompt = buildRefinePrompt({ ...result, retryStrict: false })

  let parsed
  try {
    parsed = await callAndParse(firstPrompt)
  } catch (firstErr) {
    if (firstErr instanceof LLMError) {
      return Response.json(
        { error: 'provider-unavailable', provider: firstErr.provider, message: firstErr.message },
        { status: 503 },
      )
    }
    // parse failure — single strict retry
    try {
      const strictPrompt = buildRefinePrompt({ ...result, retryStrict: true })
      parsed = await callAndParse(strictPrompt)
    } catch (secondErr) {
      const message = secondErr instanceof Error ? secondErr.message : 'Unknown'
      return Response.json(
        { error: 'malformed-output', provider, message },
        { status: 502 },
      )
    }
  }

  return new Response(
    JSON.stringify({
      languageDelta: parsed.languageDelta,
      verdictText: parsed.verdictText,
      explanations: parsed.explanations,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-LLM-Provider': provider,
        'X-LLM-Model': model,
      },
    },
  )
}
