export class LLMError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

async function callOllama(prompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:14b'

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  })

  if (!res.ok) {
    throw new LLMError(`Ollama responded ${res.status}: ${await res.text()}`, 'ollama')
  }

  const data = (await res.json()) as { response: string }
  return data.response
}

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new LLMError('GROQ_API_KEY not set', 'groq')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    }),
  })

  if (!res.ok) {
    throw new LLMError(`Groq responded ${res.status}: ${await res.text()}`, 'groq')
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new LLMError('GEMINI_API_KEY not set', 'gemini')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  )

  if (!res.ok) {
    throw new LLMError(`Gemini responded ${res.status}: ${await res.text()}`, 'gemini')
  }

  const data = (await res.json()) as {
    candidates: { content: { parts: { text: string }[] } }[]
  }
  return data.candidates[0].content.parts[0].text
}

export async function callLLM(prompt: string): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? 'ollama'

  try {
    if (provider === 'groq') return await callGroq(prompt)
    if (provider === 'gemini') return await callGemini(prompt)
    return await callOllama(prompt)
  } catch (err) {
    // prod fallback: groq → ollama
    if (provider === 'groq') {
      try {
        return await callOllama(prompt)
      } catch {
        throw new LLMError(
          'AI provider unreachable. Check connection or switch to local mode.',
          'ollama-fallback',
        )
      }
    }
    throw err
  }
}
