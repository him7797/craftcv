const COPY: Record<string, string> = {
  ollama: 'RUNNING LOCALLY · NO DATA SENT TO CLOUD',
  groq: 'RUNNING ON GROQ · 14,400/DAY FREE TIER',
  gemini: 'RUNNING ON GEMINI · CLOUD INFERENCE',
}

function getProvider(): 'ollama' | 'groq' | 'gemini' {
  const v = (process.env.NEXT_PUBLIC_LLM_PROVIDER ?? 'ollama').toLowerCase()
  if (v === 'groq' || v === 'gemini') return v
  return 'ollama'
}

export default function PrivacyStatusLine() {
  const provider = getProvider()
  return <div className="tailor-privacy">{COPY[provider]}</div>
}
