/** Client-side mirror of resolveProvider().
 *  Priority: NEXT_PUBLIC_LLM_PROVIDER (explicit) > NEXT_PUBLIC_APP_ENV (auto). */
export function resolveClientProvider(): 'ollama' | 'groq' | 'gemini' {
  const explicit = process.env.NEXT_PUBLIC_LLM_PROVIDER?.toLowerCase()
  if (explicit === 'groq' || explicit === 'gemini' || explicit === 'ollama') return explicit

  const env = process.env.NEXT_PUBLIC_APP_ENV ?? 'development'
  if (env === 'production' || env === 'staging') return 'groq'
  return 'ollama'
}
