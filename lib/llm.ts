export class LLMError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
  ) {
    super(message)
    this.name = 'LLMError'
  }
}

/** Resolves the active LLM provider from environment variables.
 *  Priority: LLM_PROVIDER (explicit) > APP_ENV/NODE_ENV (auto).
 *  Throws LLMError in production when no cloud API key is configured. */
export function resolveProvider(): 'ollama' | 'groq' | 'gemini' {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase()
  if (explicit === 'groq' || explicit === 'gemini' || explicit === 'ollama') return explicit

  const env = process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development'
  if (env === 'production' || env === 'staging') {
    if (process.env.GROQ_API_KEY) return 'groq'
    if (process.env.GEMINI_API_KEY) return 'gemini'
    throw new LLMError(
      'Production LLM not configured. Set GROQ_API_KEY (or GEMINI_API_KEY) in your environment.',
      'none',
    )
  }
  return 'ollama'
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
  const provider = resolveProvider()

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

// ─── Streaming (003-editor-screen) ──────────────────────────────────────────

export type StreamHandle = {
  provider: 'ollama' | 'groq' | 'gemini'
  model: string
  stream: AsyncIterable<string>
}

async function* readLines(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      if (buffer.trim().length > 0) yield buffer
      return
    }
    buffer += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 1)
      if (line.length > 0) yield line
    }
  }
}

async function openOllamaStream(prompt: string): Promise<StreamHandle> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:14b'

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: true }),
  })

  if (!res.ok || !res.body) {
    throw new LLMError(`Ollama responded ${res.status}`, 'ollama')
  }

  const reader = res.body.getReader()

  async function* iter(): AsyncIterable<string> {
    for await (const line of readLines(reader)) {
      try {
        const obj = JSON.parse(line) as { response?: string; done?: boolean }
        if (obj.response) yield obj.response
        if (obj.done) return
      } catch {
        // skip malformed line
      }
    }
  }

  return { provider: 'ollama', model, stream: iter() }
}

async function openGroqStream(prompt: string): Promise<StreamHandle> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new LLMError('GROQ_API_KEY not set', 'groq')

  const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) {
    throw new LLMError(`Groq responded ${res.status}`, 'groq')
  }

  const reader = res.body.getReader()

  async function* iter(): AsyncIterable<string> {
    for await (const line of readLines(reader)) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') return
      try {
        const obj = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[]
        }
        const token = obj.choices?.[0]?.delta?.content
        if (token) yield token
      } catch {
        // skip malformed line
      }
    }
  }

  return { provider: 'groq', model, stream: iter() }
}

async function openGeminiStream(prompt: string): Promise<StreamHandle> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new LLMError('GEMINI_API_KEY not set', 'gemini')

  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  )

  if (!res.ok || !res.body) {
    throw new LLMError(`Gemini responded ${res.status}`, 'gemini')
  }

  const reader = res.body.getReader()

  async function* iter(): AsyncIterable<string> {
    for await (const line of readLines(reader)) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      try {
        const obj = JSON.parse(payload) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        const token = obj.candidates?.[0]?.content?.parts?.[0]?.text
        if (token) yield token
      } catch {
        // skip malformed line
      }
    }
  }

  return { provider: 'gemini', model, stream: iter() }
}

/**
 * Open a streaming LLM connection. Honors LLM_PROVIDER env. Groq failures
 * fall back to Ollama (mirrors callLLM behavior). Returns a handle that
 * tells the caller which provider/model actually served — used to set
 * X-LLM-Provider / X-LLM-Model on the route response.
 */
export async function streamLLM(prompt: string): Promise<StreamHandle> {
  const provider = resolveProvider()

  try {
    if (provider === 'groq') return await openGroqStream(prompt)
    if (provider === 'gemini') return await openGeminiStream(prompt)
    return await openOllamaStream(prompt)
  } catch (err) {
    if (provider === 'groq') {
      try {
        return await openOllamaStream(prompt)
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
