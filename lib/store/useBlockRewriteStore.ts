import { create } from 'zustand'
import type { BlockContent, BlockPath, BlockRewriteSession, RetryHint, RewriteResult } from '@/lib/types'
import { useStore } from '@/lib/store'
import { scheduleSave } from '@/lib/editor/autosave'

const MAX_RETRIES = 3

type PendingUndo = {
  blockPath: BlockPath
  previousContent: BlockContent
}

type BlockRewriteStore = {
  session: BlockRewriteSession | null
  toastVisible: boolean
  pendingUndo: PendingUndo | null
  onAccepted: (() => void) | null

  startRewrite: (blockPath: BlockPath, sourceContent: BlockContent) => void
  appendToken: (token: string) => void
  finishStream: (result: RewriteResult) => void
  setError: (msg: string) => void
  acceptSuggestion: () => void
  rejectSuggestion: () => void
  retryWithHint: (hint: RetryHint) => void
  enterEditMode: () => void
  saveEdit: (edited: BlockContent) => void
  undoLastAccept: () => void
  cancelRewrite: () => void
  dismissToast: () => void
  setOnAccepted: (cb: () => void) => void
}

function applyBlockContent(blockPath: BlockPath, content: BlockContent): void {
  const { versions, editor } = useStore.getState()
  const active = versions[editor.activeVersionId]
  if (!active) return

  const resume = structuredClone(active.resume)

  switch (blockPath.blockType) {
    case 'experience-description': {
      const exp = resume.experience[blockPath.expIndex]
      if (!exp) return
      const c = content as Extract<BlockContent, { blockType: 'experience-description' }>
      exp.description = c.text
      break
    }
    case 'experience-bullets': {
      const exp = resume.experience[blockPath.expIndex]
      if (!exp) return
      const c = content as Extract<BlockContent, { blockType: 'experience-bullets' }>
      if (blockPath.clientIndex !== null) {
        const client = exp.clients?.[blockPath.clientIndex]
        if (!client) return
        client.bullets = c.bullets
      } else {
        exp.bullets = c.bullets
      }
      break
    }
    case 'project-block': {
      const proj = resume.projects?.[blockPath.projectIndex]
      if (!proj) return
      const c = content as Extract<BlockContent, { blockType: 'project-block' }>
      proj.name = c.name
      proj.description = c.description
      proj.tech = c.tech
      proj.bullets = c.bullets
      if (c.link !== undefined) proj.link = c.link
      break
    }
    case 'skills-section': {
      const c = content as Extract<BlockContent, { blockType: 'skills-section' }>
      resume.skills = c.categories
      break
    }
  }

  const now = new Date().toISOString()
  const nextVersions = { ...versions, [active.id]: { ...active, resume } }
  const nextEditor = { ...editor, lastSavedAt: now }
  useStore.setState({ versions: nextVersions, editor: nextEditor })
  scheduleSave({
    schemaVersion: 1,
    activeVersionId: editor.activeVersionId,
    versions: nextVersions,
    lastSavedAt: now,
  })
}

let toastTimerId: ReturnType<typeof setTimeout> | null = null

export const useBlockRewriteStore = create<BlockRewriteStore>((set, get) => ({
  session: null,
  toastVisible: false,
  pendingUndo: null,
  onAccepted: null,

  startRewrite: (blockPath, sourceContent) => {
    set({
      session: {
        blockPath,
        streaming: true,
        rawStreamText: '',
        suggestion: null,
        retriesLeft: MAX_RETRIES,
        error: null,
        previousContent: sourceContent,
        editMode: false,
      },
    })
  },

  appendToken: (token) => {
    set((s) => {
      if (!s.session) return s
      return { session: { ...s.session, rawStreamText: s.session.rawStreamText + token } }
    })
  },

  finishStream: (result) => {
    set((s) => {
      if (!s.session) return s
      return { session: { ...s.session, streaming: false, suggestion: result } }
    })
  },

  setError: (msg) => {
    set((s) => {
      if (!s.session) return s
      return { session: { ...s.session, streaming: false, error: msg } }
    })
  },

  acceptSuggestion: () => {
    const { session, onAccepted } = get()
    if (!session?.suggestion) return
    const { blockPath } = session
    const previousContent = session.suggestion.before
    applyBlockContent(blockPath, session.suggestion.after)
    if (toastTimerId) clearTimeout(toastTimerId)
    toastTimerId = setTimeout(() => {
      useBlockRewriteStore.setState({ toastVisible: false, pendingUndo: null })
    }, 8000)
    set({ session: null, pendingUndo: { blockPath, previousContent }, toastVisible: true, onAccepted: null })
    onAccepted?.()
  },

  rejectSuggestion: () => {
    set({ session: null, toastVisible: false, onAccepted: null })
  },

  retryWithHint: (hint) => {
    set((s) => {
      if (!s.session) return s
      return {
        session: {
          ...s.session,
          streaming: true,
          rawStreamText: '',
          suggestion: null,
          retriesLeft: s.session.retriesLeft - 1,
          error: null,
          editMode: false,
        },
      }
    })
    void hint
  },

  enterEditMode: () => {
    set((s) => {
      if (!s.session) return s
      return { session: { ...s.session, editMode: true } }
    })
  },

  saveEdit: (edited) => {
    const { session, onAccepted } = get()
    if (!session) return
    const previousContent = session.suggestion?.before ?? null
    applyBlockContent(session.blockPath, edited)
    if (toastTimerId) clearTimeout(toastTimerId)
    toastTimerId = setTimeout(() => {
      useBlockRewriteStore.setState({ toastVisible: false, pendingUndo: null })
    }, 8000)
    set({
      session: null,
      pendingUndo: previousContent ? { blockPath: session.blockPath, previousContent } : null,
      toastVisible: true,
      onAccepted: null,
    })
    onAccepted?.()
  },

  undoLastAccept: () => {
    const { pendingUndo } = get()
    if (!pendingUndo) return
    applyBlockContent(pendingUndo.blockPath, pendingUndo.previousContent)
    if (toastTimerId) clearTimeout(toastTimerId)
    set({ pendingUndo: null, toastVisible: false })
  },

  cancelRewrite: () => {
    set({ session: null, toastVisible: false, onAccepted: null })
  },

  dismissToast: () => {
    if (toastTimerId) clearTimeout(toastTimerId)
    set({ toastVisible: false, pendingUndo: null })
  },

  setOnAccepted: (cb) => set({ onAccepted: cb }),
}))
