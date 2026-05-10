import type { ScoreRefineRequest } from './prompts/scoreRefinement'

export type ScoreRefineResponseBody = {
  languageDelta: number
  verdictText: string
  explanations: Record<string, string>
  provider: string
  model: string
}

export type ScoreRefineErrorPayload = {
  error: string
  message?: string
  provider?: string
}

export class ScoreRefineError extends Error {
  constructor(public readonly payload: ScoreRefineErrorPayload) {
    super(payload.message ?? payload.error)
    this.name = 'ScoreRefineError'
  }
}

export async function refineWithAi(req: ScoreRefineRequest): Promise<ScoreRefineResponseBody> {
  const res = await fetch('/api/score-refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({
      error: 'unknown',
      message: res.statusText,
    }))) as ScoreRefineErrorPayload
    throw new ScoreRefineError(payload)
  }

  const provider = res.headers.get('x-llm-provider') ?? 'unknown'
  const model = res.headers.get('x-llm-model') ?? 'unknown'

  const data = (await res.json()) as Omit<ScoreRefineResponseBody, 'provider' | 'model'>
  return { ...data, provider, model }
}
