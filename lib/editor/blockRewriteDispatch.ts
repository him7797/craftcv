import { useStore } from '@/lib/store'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
import { useTailorStore } from '@/lib/store/useTailorStore'
import { rewriteBlock, RewriteBlockError } from './rewriteBlock'
import type { BlockContent, BlockPath, Resume, RetryHint } from '@/lib/types'
import type { RewriteBlockRequest } from './prompts/rewriteBlock'

let activeController: AbortController | null = null
let pendingSourceContent: BlockContent | null = null

function abortActive() {
  if (activeController) {
    activeController.abort()
    activeController = null
  }
}

export function extractBlockContent(blockPath: BlockPath, resume: Resume): BlockContent | null {
  switch (blockPath.blockType) {
    case 'experience-description': {
      const exp = resume.experience[blockPath.expIndex]
      if (!exp) return null
      return { blockType: 'experience-description', text: exp.description ?? '' }
    }
    case 'experience-bullets': {
      const exp = resume.experience[blockPath.expIndex]
      if (!exp) return null
      const bullets =
        blockPath.clientIndex !== null
          ? (exp.clients?.[blockPath.clientIndex]?.bullets ?? [])
          : (exp.bullets ?? [])
      return { blockType: 'experience-bullets', bullets }
    }
    case 'project-block': {
      const proj = resume.projects?.[blockPath.projectIndex]
      if (!proj) return null
      return {
        blockType: 'project-block',
        name: proj.name,
        description: proj.description,
        tech: proj.tech ?? [],
        bullets: proj.bullets ?? [],
        link: proj.link,
      }
    }
    case 'skills-section':
      return { blockType: 'skills-section', categories: resume.skills }
  }
}

function buildRequest(sourceContent: BlockContent, retryHint?: RetryHint): RewriteBlockRequest {
  const { versions, editor } = useStore.getState()
  const active = versions[editor.activeVersionId]
  const resume = active?.resume

  const experience = resume?.experience ?? []
  const otherJobs = experience.map((e) => `${e.role} at ${e.company}`).slice(0, 5)

  const allTech = new Set<string>()
  for (const exp of experience) {
    for (const client of exp.clients ?? []) {
      for (const t of client.tech ?? []) allTech.add(t)
    }
  }
  for (const proj of resume?.projects ?? []) {
    for (const t of proj.tech ?? []) allTech.add(t)
  }

  const totalYears = Math.max(1, Math.round(experience.length * 1.5))

  let jdContext: RewriteBlockRequest['jdContext'] | undefined
  try {
    const tailorState = useTailorStore.getState()
    const activeProfile = tailorState.profiles.find((p) => p.id === tailorState.activeProfileId)
    if (activeProfile?.jdText && activeProfile.jdText.length >= 200) {
      const analysis = activeProfile.lastAnalysis
      jdContext = {
        jdText: activeProfile.jdText,
        missingKeywords: analysis?.keywords.missing ?? [],
        matchScore: analysis?.matchScore ?? 0,
      }
    }
  } catch {
    // tailor store not available — continue without JD context
  }

  return {
    blockType: sourceContent.blockType,
    blockContent: sourceContent,
    resumeContext: {
      name: resume?.header.name ?? '',
      role: experience[0]?.role ?? 'Software Engineer',
      totalYears,
      otherJobs,
      otherTechMentioned: Array.from(allTech).slice(0, 20),
    },
    jdContext,
    retryHint,
  }
}

async function pump(controller: AbortController, sourceContent: BlockContent, retryHint?: RetryHint): Promise<void> {
  const req = buildRequest(sourceContent, retryHint)

  try {
    for await (const event of rewriteBlock(req, controller.signal)) {
      if (controller.signal.aborted) return

      switch (event.type) {
        case 'token':
          useBlockRewriteStore.getState().appendToken(event.value)
          break
        case 'done':
          useBlockRewriteStore.getState().finishStream(event.result)
          return
        case 'retry':
          // Server-side validation retry in progress — no UI change needed
          break
        case 'error':
          useBlockRewriteStore.getState().setError(event.message)
          return
      }
    }
  } catch (err) {
    if (controller.signal.aborted) return
    const message =
      err instanceof RewriteBlockError
        ? (err.payload.message ?? err.payload.error)
        : err instanceof Error
          ? err.message
          : 'AI request failed.'
    useBlockRewriteStore.getState().setError(message)
  } finally {
    if (activeController === controller) activeController = null
  }
}

export function dispatchBlockRewrite(blockPath: BlockPath, sourceContent: BlockContent): void {
  abortActive()
  pendingSourceContent = sourceContent
  useBlockRewriteStore.getState().startRewrite(blockPath, sourceContent)
  const controller = new AbortController()
  activeController = controller
  void pump(controller, sourceContent)
}

export function dispatchBlockRetry(hint: RetryHint): void {
  const { session } = useBlockRewriteStore.getState()
  if (!session || session.retriesLeft <= 0) return

  const sourceContent = pendingSourceContent
  if (!sourceContent) return

  abortActive()
  useBlockRewriteStore.getState().retryWithHint(hint)
  const controller = new AbortController()
  activeController = controller
  void pump(controller, sourceContent, hint)
}

export function cancelBlockRewrite(): void {
  abortActive()
  pendingSourceContent = null
  useBlockRewriteStore.getState().cancelRewrite()
}
