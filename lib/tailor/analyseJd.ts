import type {
  AnalysisResult,
  LanguageSuggestion,
  Resume,
  SmartCatch,
} from '@/lib/types'
import { extractKeywords, normalizeForMatch } from './keywordExtractor'
import { diffKeywords } from './keywordMatcher'
import { flattenResumeText } from './flattenResume'
import { compactResume, type AnalyseRequest } from './prompts/tailorAnalysis'

export type AnalysisErrorPayload = {
  error: string
  message?: string
  provider?: string
}

export class AnalysisError extends Error {
  constructor(public readonly payload: AnalysisErrorPayload) {
    super(payload.message ?? payload.error)
    this.name = 'AnalysisError'
  }
}

type AiResponseBody = {
  matchScore?: number
  subscores?: {
    technologies?: number
    languageMirror?: number
    domainTerms?: number
  }
  languageSuggestions?: LanguageSuggestion[]
}

function clamp01to100(n: unknown): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function recomputeOverall(subscores: { technologies: number; languageMirror: number; domainTerms: number }): number {
  return Math.round(
    0.4 * subscores.technologies + 0.35 * subscores.languageMirror + 0.25 * subscores.domainTerms,
  )
}

function isVerbatimSubstring(needle: string, haystack: string): boolean {
  if (!needle || !haystack) return false
  const n = normalizeForMatch(needle)
  const h = normalizeForMatch(haystack)
  if (!n) return false
  return h.includes(n)
}

function validateSuggestions(
  raw: unknown,
  resumeText: string,
  jdText: string,
): LanguageSuggestion[] {
  if (!Array.isArray(raw)) return []
  const out: LanguageSuggestion[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as LanguageSuggestion
    if (typeof e.resumeSays !== 'string' || typeof e.jdLanguage !== 'string') continue
    if (!isVerbatimSubstring(e.resumeSays, resumeText)) continue
    if (!isVerbatimSubstring(e.jdLanguage, jdText)) continue
    const rationale =
      typeof e.rationale === 'string' && e.rationale.trim().length > 0
        ? e.rationale.trim()
        : undefined
    out.push({
      resumeSays: e.resumeSays.trim(),
      jdLanguage: e.jdLanguage.trim(),
      rationale,
    })
    if (out.length >= 5) break
  }
  return out
}

function extractJsonObject(buffer: string): string | null {
  // Find the first '{' and the matching closing '}' accounting for nesting
  // and string-aware (don't count braces inside strings).
  let start = -1
  let depth = 0
  let inStr = false
  let escape = false
  for (let i = 0; i < buffer.length; i++) {
    const ch = buffer[i]
    if (escape) {
      escape = false
      continue
    }
    if (inStr) {
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === '"') {
        inStr = false
      }
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
      if (depth === 0 && start >= 0) {
        return buffer.slice(start, i + 1)
      }
    }
  }
  return null
}

async function fetchAndParse(req: AnalyseRequest): Promise<{
  body: AiResponseBody
  provider: string
  model: string
}> {
  const res = await fetch('/api/analyse-jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({
      error: 'unknown',
      message: res.statusText,
    }))) as AnalysisErrorPayload
    throw new AnalysisError(payload)
  }

  const provider = res.headers.get('x-llm-provider') ?? 'unknown'
  const model = res.headers.get('x-llm-model') ?? 'unknown'

  if (!res.body) throw new AnalysisError({ error: 'empty-response' })

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
  }

  const json = extractJsonObject(buffer)
  if (!json) throw new AnalysisError({ error: 'malformed-output', message: 'Could not extract JSON object from response.' })

  let parsed: AiResponseBody
  try {
    parsed = JSON.parse(json) as AiResponseBody
  } catch (err) {
    throw new AnalysisError({
      error: 'malformed-output',
      message: err instanceof Error ? err.message : 'JSON parse error.',
    })
  }

  return { body: parsed, provider, model }
}

export type RunAnalysisInput = {
  jdText: string
  activeResume: Resume
  smartCatches: SmartCatch[]
}

/**
 * Run the full analysis pipeline:
 *   1. extract JD keywords
 *   2. diff against active resume
 *   3. (smartCatches passed in by caller — computed by smartCatchFinder)
 *   4. POST /api/analyse-jd → AI sub-scores + suggestions
 *   5. validate suggestions verbatim; retry once strict on schema fail
 *   6. merge → AnalysisResult
 */
export async function runAnalysis(input: RunAnalysisInput): Promise<AnalysisResult> {
  const jdText = input.jdText.trim()
  if (!jdText) {
    throw new AnalysisError({ error: 'invalid-request', message: 'JD text is empty.' })
  }

  const jdKeywords = extractKeywords(jdText)
  const resumeText = flattenResumeText(input.activeResume)
  const diff = diffKeywords(jdKeywords, resumeText)

  const compact = compactResume(input.activeResume)

  let aiBody: AiResponseBody
  let provider = 'unknown'
  let model = 'unknown'
  let didRetry = false

  const baseRequest: AnalyseRequest = {
    jdText,
    activeResume: compact,
    diff: {
      presentKeywords: diff.present,
      missingKeywords: diff.missing,
    },
    retryStrict: false,
  }

  const firstAttempt = await fetchAndParse(baseRequest).catch(
    (err) => err as AnalysisError,
  )

  if (firstAttempt instanceof AnalysisError) {
    if (firstAttempt.payload.error === 'malformed-output') {
      const retry = await fetchAndParse({ ...baseRequest, retryStrict: true })
      aiBody = retry.body
      provider = retry.provider
      model = retry.model
      didRetry = true
    } else {
      throw firstAttempt
    }
  } else {
    aiBody = firstAttempt.body
    provider = firstAttempt.provider
    model = firstAttempt.model
  }

  const subscores = {
    technologies: clamp01to100(aiBody.subscores?.technologies),
    languageMirror: clamp01to100(aiBody.subscores?.languageMirror),
    domainTerms: clamp01to100(aiBody.subscores?.domainTerms),
  }

  let validatedSuggestions = validateSuggestions(
    aiBody.languageSuggestions,
    resumeText,
    jdText,
  )

  // If fewer than 3 valid AND we haven't yet retried strict, retry once.
  if (validatedSuggestions.length < 3 && !didRetry) {
    try {
      const retry = await fetchAndParse({ ...baseRequest, retryStrict: true })
      const retryValidated = validateSuggestions(
        retry.body.languageSuggestions,
        resumeText,
        jdText,
      )
      if (retryValidated.length > validatedSuggestions.length) {
        validatedSuggestions = retryValidated
        aiBody = retry.body
        provider = retry.provider
        model = retry.model
      }
    } catch {
      // Accept whatever we have rather than fail.
    }
  }

  const aiOverall = clamp01to100(aiBody.matchScore)
  const computedOverall = recomputeOverall(subscores)
  const matchScore = Math.abs(aiOverall - computedOverall) > 5 ? computedOverall : aiOverall

  return {
    matchScore,
    subscores,
    keywords: {
      present: diff.present,
      missing: diff.missing,
    },
    smartCatches: input.smartCatches,
    languageSuggestions: validatedSuggestions,
    analysedAt: new Date().toISOString(),
    modelUsed: model !== 'unknown' ? model : provider,
  }
}
