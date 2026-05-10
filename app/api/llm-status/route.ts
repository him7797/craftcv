import type { LlmStatus } from '@/lib/types'

export const runtime = 'nodejs'

let cache: { at: number; value: LlmStatus } | null = null
const TTL_MS = 30_000

async function fetchStatus(): Promise<LlmStatus> {
  const provider = (process.env.LLM_PROVIDER ?? 'ollama') as LlmStatus['provider']

  const rewriteModel =
    provider === 'ollama'
      ? (process.env.OLLAMA_MODEL ?? 'qwen2.5:14b')
      : provider === 'groq'
        ? (process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile')
        : (process.env.GEMINI_MODEL ?? 'gemini-1.5-flash')

  const scoreModel = 'rule-based · no LLM call'

  const base: LlmStatus = {
    provider,
    model: { rewrite: rewriteModel, score: scoreModel },
    status: 'down',
  }

  try {
    if (provider === 'ollama') {
      const url = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434') + '/api/tags'
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) })
      return { ...base, status: res.ok ? 'running' : 'down' }
    }
    if (provider === 'groq') {
      if (!process.env.GROQ_API_KEY) return { ...base, status: 'down' }
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        signal: AbortSignal.timeout(3000),
      })
      if (res.status === 429) {
        const limit = Number(res.headers.get('x-ratelimit-limit-requests') ?? 0)
        const remaining = Number(res.headers.get('x-ratelimit-remaining-requests') ?? 0)
        return {
          ...base,
          status: 'rate-limited',
          usage: { used: Math.max(0, limit - remaining), limit },
        }
      }
      return { ...base, status: res.ok ? 'connected' : 'down' }
    }
    // gemini
    if (!process.env.GEMINI_API_KEY) return { ...base, status: 'down' }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      { signal: AbortSignal.timeout(3000) },
    )
    if (res.status === 429) return { ...base, status: 'rate-limited' }
    return { ...base, status: res.ok ? 'connected' : 'down' }
  } catch {
    return { ...base, status: 'down' }
  }
}

export async function GET() {
  const now = Date.now()
  if (cache && now - cache.at < TTL_MS) {
    return Response.json(cache.value)
  }
  const value = await fetchStatus()
  cache = { at: now, value }
  return Response.json(value)
}
