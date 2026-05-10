import { useStore } from '@/lib/store'
import { buildContextForTarget } from './aiContext'
import { RewriteError, rewriteBullet } from './rewriteBullet'
import type { AiSession, AiSessionTarget } from '@/lib/types'

let activeController: AbortController | null = null

function abortActive() {
  if (activeController) {
    activeController.abort()
    activeController = null
  }
}

async function pump(controller: AbortController, retryHint?: AiSession['hint']) {
  const { editor, versions, appendAiToken, finishAiSession, setAiError } = useStore.getState()
  const session = editor.aiSession
  if (!session) return
  const active = versions[editor.activeVersionId]
  if (!active) return

  const ctx = buildContextForTarget(active.resume, session.target)
  try {
    for await (const token of rewriteBullet(
      { rough: session.rough, context: ctx, retryHint },
      controller.signal,
    )) {
      if (controller.signal.aborted) return
      appendAiToken(token)
    }
    if (!controller.signal.aborted) finishAiSession()
  } catch (err) {
    if (controller.signal.aborted) return
    const message =
      err instanceof RewriteError
        ? (err.payload.message ?? err.payload.error)
        : err instanceof Error
          ? err.message
          : 'AI request failed.'
    setAiError(message)
  } finally {
    if (activeController === controller) activeController = null
  }
}

export function dispatchRewrite(target: AiSessionTarget, rough: string): void {
  abortActive()
  useStore.getState().startAiSession(target, rough.trim())
  const controller = new AbortController()
  activeController = controller
  void pump(controller)
}

export function dispatchRetry(hint?: AiSession['hint']): void {
  const session = useStore.getState().editor.aiSession
  if (!session || session.retriesLeft <= 0) return
  abortActive()
  useStore.getState().retryAiSession(hint)
  const controller = new AbortController()
  activeController = controller
  void pump(controller, hint)
}

export function cancelActiveStream(): void {
  abortActive()
}
