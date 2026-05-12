import { resolveClientProvider } from '@/lib/llm-client'

type Provider = 'ollama' | 'groq' | 'gemini' | 'fallback'

const MODEL_LABEL: Record<Provider, string> = {
  ollama: 'QWEN2.5:7B',
  groq: 'LLAMA-3.3-70B',
  gemini: 'GEMINI FLASH',
  fallback: 'RULE-BASED',
}

const PROVIDER_LABEL: Record<Provider, string> = {
  ollama: 'OLLAMA LOCAL',
  groq: 'GROQ CLOUD',
  gemini: 'GEMINI CLOUD',
  fallback: 'FALLBACK',
}

export function getActiveProvider(): Provider {
  return resolveClientProvider()
}

export function getModelLabel(provider: string): string {
  return MODEL_LABEL[(provider as Provider) ?? 'ollama'] ?? MODEL_LABEL.ollama
}

export function getProviderLabel(provider: string): string {
  return PROVIDER_LABEL[(provider as Provider) ?? 'ollama'] ?? PROVIDER_LABEL.ollama
}
