import { create } from 'zustand'
import type {
  Resume,
  ScoreResult,
  Version,
  EditorState,
  EditorSection,
  PersistedSnapshot,
  BulletPath,
  ParentPath,
  AiSessionTarget,
  AiSession,
} from './types'
import { scheduleSave, flushSave } from './editor/autosave'

type ResumeMutator = (resume: Resume) => void

interface CraftCVStore {
  // ─── 002-upload-cv (kept for back-compat) ────────────────────────────────
  resume: Resume | null
  score: ScoreResult | null
  topIssues: string[]
  setParseResult: (resume: Resume, score: ScoreResult) => void
  clearResume: () => void

  // ─── 003-editor-screen ───────────────────────────────────────────────────
  versions: Record<string, Version>
  editor: EditorState

  // hydration
  hydrateFromSnapshot: (snapshot: PersistedSnapshot) => void
  initFromUpload: () => void

  // version ops
  switchVersion: (id: string) => void
  createVersion: (name: string, branchFromId: string) => string | null
  deleteVersion: (id: string) => void
  renameVersion: (id: string, name: string) => void

  // editor ops
  setActiveSection: (section: EditorSection) => void
  forceSave: () => void

  // bullet mutations
  addBullet: (parent: ParentPath, text: string) => void
  updateBullet: (path: BulletPath, text: string) => void
  deleteBullet: (path: BulletPath) => void
  reorderBullets: (path: BulletPath, direction: 'up' | 'down') => void

  // experience mutations
  addExperience: () => void
  removeExperience: (index: number) => void
  updateExperienceField: (
    index: number,
    field: 'company' | 'role' | 'startDate' | 'endDate',
    value: string,
  ) => void

  // skills
  addSkillCategory: () => void
  removeSkillCategory: (index: number) => void
  updateSkillCategory: (index: number, name: string) => void
  updateSkillItems: (index: number, items: string[]) => void

  // education
  addEducation: () => void
  removeEducation: (index: number) => void
  updateEducationField: (
    index: number,
    field: 'institution' | 'degree' | 'startYear' | 'endYear',
    value: string,
  ) => void

  // projects
  addProject: () => void
  removeProject: (index: number) => void
  updateProjectField: (
    index: number,
    field: 'name' | 'description' | 'link',
    value: string,
  ) => void
  updateProjectTech: (index: number, tech: string[]) => void

  // header
  updateHeaderField: (field: 'name' | 'location' | 'email', value: string) => void
  addHeaderLink: () => void
  removeHeaderLink: (index: number) => void
  updateHeaderLink: (index: number, link: { label: string; url: string }) => void

  // AI session
  startAiSession: (target: AiSessionTarget, rough: string) => void
  appendAiToken: (token: string) => void
  finishAiSession: () => void
  acceptAiSuggestion: () => void
  skipAiSession: () => void
  retryAiSession: (hint?: AiSession['hint']) => void
  setAiError: (message: string) => void
}

const DEFAULT_EDITOR: EditorState = {
  activeSection: 'experience',
  activeVersionId: 'master',
  aiSession: null,
  retryCounts: {},
  lastSavedAt: null,
}

const MAX_RETRIES = 3

function buildSnapshot(state: {
  versions: Record<string, Version>
  editor: EditorState
}): PersistedSnapshot {
  return {
    schemaVersion: 1,
    activeVersionId: state.editor.activeVersionId,
    versions: state.versions,
    lastSavedAt: state.editor.lastSavedAt ?? new Date().toISOString(),
  }
}

function pathKey(path: BulletPath): string {
  if (path.section === 'experience') {
    return `e:${path.expIndex}:${path.clientIndex ?? 'top'}:${path.bulletIndex}`
  }
  return `p:${path.projectIndex}:${path.bulletIndex}`
}

function targetKey(target: AiSessionTarget): string {
  if ('section' in target && target.section === 'new-bullet') {
    const p = target.parent
    if (p.section === 'experience') return `nb:e:${p.expIndex}:${p.clientIndex ?? 'top'}`
    return `nb:p:${p.projectIndex}`
  }
  return pathKey(target as BulletPath)
}

function getBulletArray(resume: Resume, parent: ParentPath): string[] | null {
  if (parent.section === 'experience') {
    const exp = resume.experience[parent.expIndex]
    if (!exp) return null
    if (parent.clientIndex !== null) {
      const client = exp.clients?.[parent.clientIndex]
      return client ? client.bullets : null
    }
    if (!exp.bullets) exp.bullets = []
    return exp.bullets
  }
  // projects — schema doesn't currently include bullets, but support if added
  const proj = resume.projects?.[parent.projectIndex] as
    | { bullets?: string[] }
    | undefined
  if (!proj) return null
  if (!proj.bullets) proj.bullets = []
  return proj.bullets
}

function getBulletArrayByPath(resume: Resume, path: BulletPath): string[] | null {
  if (path.section === 'experience') {
    return getBulletArray(resume, {
      section: 'experience',
      expIndex: path.expIndex,
      clientIndex: path.clientIndex,
    })
  }
  return getBulletArray(resume, { section: 'projects', projectIndex: path.projectIndex })
}

export const useStore = create<CraftCVStore>((set, get) => {
  function mutate(updater: ResumeMutator) {
    const { versions, editor } = get()
    const active = versions[editor.activeVersionId]
    if (!active) return
    const cloned = structuredClone(active.resume)
    updater(cloned)
    const now = new Date().toISOString()
    const nextVersions: Record<string, Version> = {
      ...versions,
      [active.id]: { ...active, resume: cloned },
    }
    const nextEditor: EditorState = { ...editor, lastSavedAt: now }
    set({ versions: nextVersions, editor: nextEditor })
    scheduleSave(buildSnapshot({ versions: nextVersions, editor: nextEditor }))
  }

  return {
    resume: null,
    score: null,
    topIssues: [],
    setParseResult: (resume, score) =>
      set({
        resume,
        score,
        topIssues: score.issues.slice(0, 3).map((i) => i.message),
      }),
    clearResume: () => set({ resume: null, score: null, topIssues: [] }),

    versions: {},
    editor: { ...DEFAULT_EDITOR },

    hydrateFromSnapshot: (snapshot) => {
      set({
        versions: snapshot.versions,
        editor: {
          ...DEFAULT_EDITOR,
          activeVersionId: snapshot.activeVersionId,
          lastSavedAt: snapshot.lastSavedAt,
        },
      })
    },

    initFromUpload: () => {
      const { resume, versions } = get()
      if (Object.keys(versions).length > 0) return
      if (!resume) return
      const now = new Date().toISOString()
      const master: Version = {
        id: 'master',
        name: 'Master Resume',
        resume,
        branchedFromId: null,
        createdAt: now,
      }
      set({
        versions: { master },
        editor: { ...DEFAULT_EDITOR, lastSavedAt: now },
      })
      flushSave(
        buildSnapshot({
          versions: { master },
          editor: { ...DEFAULT_EDITOR, lastSavedAt: now },
        }),
      )
    },

    switchVersion: (id) => {
      const { versions } = get()
      if (!versions[id]) return
      set((s) => ({
        editor: { ...s.editor, activeVersionId: id, aiSession: null, retryCounts: {} },
      }))
      const next = get()
      scheduleSave(buildSnapshot({ versions: next.versions, editor: next.editor }))
    },

    createVersion: (name, branchFromId) => {
      const trimmed = name.trim()
      if (!trimmed) return null
      const { versions } = get()
      const source = versions[branchFromId]
      if (!source) return null
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const now = new Date().toISOString()
      const next: Version = {
        id,
        name: trimmed,
        resume: structuredClone(source.resume),
        branchedFromId: source.id,
        createdAt: now,
      }
      const nextVersions = { ...versions, [id]: next }
      const nextEditor = { ...get().editor, lastSavedAt: now }
      set({ versions: nextVersions, editor: nextEditor })
      scheduleSave(buildSnapshot({ versions: nextVersions, editor: nextEditor }))
      return id
    },

    deleteVersion: (id) => {
      if (id === 'master') return
      const { versions, editor } = get()
      if (!versions[id]) return
      const nextVersions = { ...versions }
      delete nextVersions[id]
      const nextActive =
        editor.activeVersionId === id ? 'master' : editor.activeVersionId
      const now = new Date().toISOString()
      const nextEditor = {
        ...editor,
        activeVersionId: nextActive,
        aiSession: editor.activeVersionId === id ? null : editor.aiSession,
        retryCounts: editor.activeVersionId === id ? {} : editor.retryCounts,
        lastSavedAt: now,
      }
      set({ versions: nextVersions, editor: nextEditor })
      scheduleSave(buildSnapshot({ versions: nextVersions, editor: nextEditor }))
    },

    renameVersion: (id, name) => {
      const trimmed = name.trim()
      if (!trimmed) return
      const { versions } = get()
      const cur = versions[id]
      if (!cur) return
      const nextVersions = { ...versions, [id]: { ...cur, name: trimmed } }
      const now = new Date().toISOString()
      const nextEditor = { ...get().editor, lastSavedAt: now }
      set({ versions: nextVersions, editor: nextEditor })
      scheduleSave(buildSnapshot({ versions: nextVersions, editor: nextEditor }))
    },

    setActiveSection: (section) => {
      set((s) => ({ editor: { ...s.editor, activeSection: section } }))
    },

    forceSave: () => {
      const now = new Date().toISOString()
      set((s) => ({ editor: { ...s.editor, lastSavedAt: now } }))
      const next = get()
      flushSave(buildSnapshot({ versions: next.versions, editor: next.editor }))
    },

    // ─── Bullet mutations ─────────────────────────────────────────────────
    addBullet: (parent, text) =>
      mutate((r) => {
        const arr = getBulletArray(r, parent)
        if (arr) arr.push(text)
      }),

    updateBullet: (path, text) =>
      mutate((r) => {
        const arr = getBulletArrayByPath(r, path)
        if (!arr) return
        if (path.bulletIndex < 0 || path.bulletIndex >= arr.length) return
        arr[path.bulletIndex] = text
      }),

    deleteBullet: (path) =>
      mutate((r) => {
        const arr = getBulletArrayByPath(r, path)
        if (!arr) return
        if (path.bulletIndex < 0 || path.bulletIndex >= arr.length) return
        arr.splice(path.bulletIndex, 1)
      }),

    reorderBullets: (path, direction) =>
      mutate((r) => {
        const arr = getBulletArrayByPath(r, path)
        if (!arr) return
        const i = path.bulletIndex
        if (i < 0 || i >= arr.length) return
        const j = direction === 'up' ? i - 1 : i + 1
        if (j < 0 || j >= arr.length) return
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
      }),

    // ─── Experience mutations ─────────────────────────────────────────────
    addExperience: () =>
      mutate((r) => {
        r.experience.push({
          company: 'New Company',
          role: 'Role',
          startDate: '',
          endDate: '',
          bullets: [],
        })
      }),

    removeExperience: (index) =>
      mutate((r) => {
        if (index < 0 || index >= r.experience.length) return
        r.experience.splice(index, 1)
      }),

    updateExperienceField: (index, field, value) =>
      mutate((r) => {
        const exp = r.experience[index]
        if (!exp) return
        exp[field] = value
      }),

    // ─── Skills ───────────────────────────────────────────────────────────
    addSkillCategory: () =>
      mutate((r) => {
        r.skills.push({ category: 'New Category', items: [] })
      }),

    removeSkillCategory: (index) =>
      mutate((r) => {
        if (index < 0 || index >= r.skills.length) return
        r.skills.splice(index, 1)
      }),

    updateSkillCategory: (index, name) =>
      mutate((r) => {
        const cat = r.skills[index]
        if (!cat) return
        cat.category = name
      }),

    updateSkillItems: (index, items) =>
      mutate((r) => {
        const cat = r.skills[index]
        if (!cat) return
        cat.items = items
      }),

    // ─── Education ────────────────────────────────────────────────────────
    addEducation: () =>
      mutate((r) => {
        r.education.push({ institution: 'New Institution', degree: '', startYear: '', endYear: '' })
      }),

    removeEducation: (index) =>
      mutate((r) => {
        if (index < 0 || index >= r.education.length) return
        r.education.splice(index, 1)
      }),

    updateEducationField: (index, field, value) =>
      mutate((r) => {
        const edu = r.education[index]
        if (!edu) return
        edu[field] = value
      }),

    // ─── Projects ─────────────────────────────────────────────────────────
    addProject: () =>
      mutate((r) => {
        if (!r.projects) r.projects = []
        r.projects.push({ name: 'New Project', description: '' })
      }),

    removeProject: (index) =>
      mutate((r) => {
        if (!r.projects) return
        if (index < 0 || index >= r.projects.length) return
        r.projects.splice(index, 1)
      }),

    updateProjectField: (index, field, value) =>
      mutate((r) => {
        if (!r.projects) return
        const proj = r.projects[index]
        if (!proj) return
        proj[field] = value
      }),

    updateProjectTech: (index, tech) =>
      mutate((r) => {
        if (!r.projects) return
        const proj = r.projects[index]
        if (!proj) return
        proj.tech = tech
      }),

    // ─── Header ───────────────────────────────────────────────────────────
    updateHeaderField: (field, value) =>
      mutate((r) => {
        r.header[field] = value
      }),

    addHeaderLink: () =>
      mutate((r) => {
        if (!r.header.links) r.header.links = []
        r.header.links.push({ label: 'Link', url: '' })
      }),

    removeHeaderLink: (index) =>
      mutate((r) => {
        if (!r.header.links) return
        if (index < 0 || index >= r.header.links.length) return
        r.header.links.splice(index, 1)
      }),

    updateHeaderLink: (index, link) =>
      mutate((r) => {
        if (!r.header.links) return
        const cur = r.header.links[index]
        if (!cur) return
        r.header.links[index] = link
      }),

    // ─── AI session ───────────────────────────────────────────────────────
    startAiSession: (target, rough) => {
      const key = targetKey(target)
      const used = get().editor.retryCounts[key] ?? 0
      const retriesLeft = Math.max(0, MAX_RETRIES - used)
      set((s) => ({
        editor: {
          ...s.editor,
          aiSession: {
            target,
            rough,
            suggestion: '',
            streaming: true,
            retriesLeft,
          },
        },
      }))
    },

    appendAiToken: (token) => {
      set((s) => {
        if (!s.editor.aiSession) return {}
        return {
          editor: {
            ...s.editor,
            aiSession: {
              ...s.editor.aiSession,
              suggestion: s.editor.aiSession.suggestion + token,
            },
          },
        }
      })
    },

    finishAiSession: () => {
      set((s) => {
        if (!s.editor.aiSession) return {}
        return {
          editor: {
            ...s.editor,
            aiSession: { ...s.editor.aiSession, streaming: false },
          },
        }
      })
    },

    acceptAiSuggestion: () => {
      const session = get().editor.aiSession
      if (!session) return
      const text = session.suggestion.trim()
      if (!text) {
        set((s) => ({ editor: { ...s.editor, aiSession: null } }))
        return
      }
      if ('section' in session.target && session.target.section === 'new-bullet') {
        get().addBullet(session.target.parent, text)
      } else {
        const path = session.target as BulletPath
        get().updateBullet(path, text)
      }
      set((s) => ({ editor: { ...s.editor, aiSession: null } }))
    },

    skipAiSession: () => {
      set((s) => ({ editor: { ...s.editor, aiSession: null } }))
    },

    retryAiSession: (hint) => {
      const session = get().editor.aiSession
      if (!session) return
      if (session.retriesLeft <= 0) return
      const key = targetKey(session.target)
      const used = (get().editor.retryCounts[key] ?? 0) + 1
      set((s) => ({
        editor: {
          ...s.editor,
          retryCounts: { ...s.editor.retryCounts, [key]: used },
          aiSession: {
            ...session,
            suggestion: '',
            streaming: true,
            retriesLeft: Math.max(0, MAX_RETRIES - used),
            hint,
            error: undefined,
          },
        },
      }))
    },

    setAiError: (message) => {
      set((s) => {
        if (!s.editor.aiSession) return {}
        return {
          editor: {
            ...s.editor,
            aiSession: { ...s.editor.aiSession, streaming: false, error: message },
          },
        }
      })
    },
  }
})
