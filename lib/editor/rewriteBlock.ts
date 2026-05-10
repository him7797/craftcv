import type { RewriteBlockEvent } from '@/lib/types'
import type { RewriteBlockRequest } from './prompts/rewriteBlock'

export class RewriteBlockError extends Error {
  constructor(
    public readonly payload: { error: string; message?: string },
  ) {
    super(payload.message ?? payload.error)
    this.name = 'RewriteBlockError'
  }
}

export async function* rewriteBlock(
  req: RewriteBlockRequest,
  signal?: AbortSignal,
): AsyncIterable<RewriteBlockEvent> {
  const res = await fetch('/api/rewrite-block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => ({
      error: 'internal',
      message: res.statusText,
    })) as { error: string; message?: string }
    throw new RewriteBlockError(payload)
  }

  if (!res.body) return

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let idx
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim()
        buffer = buffer.slice(idx + 1)
        if (!line) continue
        try {
          const event = JSON.parse(line) as RewriteBlockEvent
          yield event
        } catch {
          // skip malformed line
        }
      }
    }
    // flush remaining
    if (buffer.trim()) {
      try {
        const event = JSON.parse(buffer.trim()) as RewriteBlockEvent
        yield event
      } catch {
        // skip
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* ignore */
    }
  }
}
