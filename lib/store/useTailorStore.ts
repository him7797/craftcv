import { create } from 'zustand'
import type {
  AnalysisResult,
  JdProfile,
  TailorPersistedDraft,
  TailorPersistedProfiles,
} from '@/lib/types'
import { SEED_PROFILES } from '@/lib/tailor/seedProfiles'

const PROFILES_KEY = 'craftcv:tailor:profiles:v1'
const DRAFT_KEY = 'craftcv:tailor:draft:v1'

function loadProfiles(): TailorPersistedProfiles | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<TailorPersistedProfiles>
    if (parsed.schemaVersion !== 1) return null
    if (!Array.isArray(parsed.profiles)) return null
    return {
      schemaVersion: 1,
      profiles: parsed.profiles as JdProfile[],
      activeProfileId: parsed.activeProfileId ?? null,
    }
  } catch {
    return null
  }
}

function saveProfiles(profiles: JdProfile[], activeProfileId: string | null): void {
  if (typeof window === 'undefined') return
  try {
    const payload: TailorPersistedProfiles = {
      schemaVersion: 1,
      profiles,
      activeProfileId,
    }
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota errors */
  }
}

function loadDraft(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return ''
    const parsed = JSON.parse(raw) as Partial<TailorPersistedDraft>
    if (parsed.schemaVersion !== 1) return ''
    return typeof parsed.draftJdText === 'string' ? parsed.draftJdText : ''
  } catch {
    return ''
  }
}

let draftTimer: ReturnType<typeof setTimeout> | null = null
function scheduleDraftSave(text: string): void {
  if (typeof window === 'undefined') return
  if (draftTimer) clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    try {
      const payload: TailorPersistedDraft = {
        schemaVersion: 1,
        draftJdText: text,
        savedAt: new Date().toISOString(),
      }
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
    draftTimer = null
  }, 250)
}

export interface TailorStore {
  profiles: JdProfile[]
  activeProfileId: string | null
  draftJdText: string
  analysing: boolean
  result: AnalysisResult | null
  error: string | null
  hydrated: boolean

  hydrate: () => void
  setDraftJdText: (text: string) => void
  loadProfile: (id: string) => void
  saveCurrentAsProfile: (name: string) => void
  deleteProfile: (id: string) => void
  setAnalysing: (analysing: boolean) => void
  setResult: (result: AnalysisResult | null) => void
  setError: (message: string | null) => void
  clearError: () => void
}

export const useTailorStore = create<TailorStore>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  draftJdText: '',
  analysing: false,
  result: null,
  error: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return
    const persisted = loadProfiles()
    const profiles = persisted?.profiles?.length ? persisted.profiles : SEED_PROFILES
    const activeProfileId = persisted?.activeProfileId ?? null
    const draftJdText = loadDraft()

    let result: AnalysisResult | null = null
    if (activeProfileId) {
      const active = profiles.find((p) => p.id === activeProfileId)
      result = active?.lastAnalysis ?? null
    }

    set({
      profiles,
      activeProfileId,
      draftJdText,
      result,
      hydrated: true,
    })

    if (!persisted) {
      saveProfiles(profiles, activeProfileId)
    }
  },

  setDraftJdText: (text) => {
    set({ draftJdText: text })
    scheduleDraftSave(text)
  },

  loadProfile: (id) => {
    const profile = get().profiles.find((p) => p.id === id)
    if (!profile) return
    set({
      activeProfileId: id,
      draftJdText: profile.jdText,
      result: profile.lastAnalysis,
      error: null,
    })
    saveProfiles(get().profiles, id)
    scheduleDraftSave(profile.jdText)
  },

  saveCurrentAsProfile: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `profile-${Date.now()}`
    const newProfile: JdProfile = {
      id,
      name: trimmed,
      jdText: get().draftJdText,
      lastAnalysis: get().result,
      createdAt: new Date().toISOString(),
    }
    const profiles = [newProfile, ...get().profiles]
    set({ profiles, activeProfileId: id })
    saveProfiles(profiles, id)
  },

  deleteProfile: (id) => {
    const profiles = get().profiles.filter((p) => p.id !== id)
    const isActive = get().activeProfileId === id
    set({
      profiles,
      activeProfileId: isActive ? null : get().activeProfileId,
      result: isActive ? null : get().result,
    })
    saveProfiles(profiles, isActive ? null : get().activeProfileId)
  },

  setAnalysing: (analysing) => set({ analysing }),

  setResult: (result) => {
    set({ result })
    const activeId = get().activeProfileId
    if (activeId && result) {
      const profiles = get().profiles.map((p) =>
        p.id === activeId ? { ...p, lastAnalysis: result } : p,
      )
      set({ profiles })
      saveProfiles(profiles, activeId)
    }
  },

  setError: (message) => set({ error: message }),
  clearError: () => set({ error: null }),
}))
