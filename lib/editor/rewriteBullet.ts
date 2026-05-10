import type { RewriteRequest } from './prompts/rewriteBullet'

export type RewriteErrorPayload = {
  error: string
  message?: string
  provider?: string
  retryAfterSec?: number
}

export class RewriteError extends Error {
  constructor(public readonly payload: RewriteErrorPayload) {
    super(payload.message ?? payload.error)
    this.name = 'RewriteError'
  }
}

export async function* rewriteBullet(
  req: RewriteRequest,
  signal?: AbortSignal,
): AsyncIterable<string> {
  const res = await fetch('/api/rewrite-bullet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  })

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({
      error: 'internal',
      message: res.statusText,
    }))) as RewriteErrorPayload
    throw new RewriteError(payload)
  }

  if (!res.body) return
  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) return
      const chunk = decoder.decode(value, { stream: true })
      if (chunk) yield chunk
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* ignore */
    }
  }
}
