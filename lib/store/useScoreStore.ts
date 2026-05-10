import { create } from 'zustand'
import type { DashboardScoreResult, ScoreHistoryEntry, ScoreState } from '@/lib/types'
import { useStore } from '@/lib/store'
import { runScore, isStale } from '@/lib/score/runScore'
import { computeContentHash } from '@/lib/score/computeScore'
import { currentIsoWeekLabel } from '@/lib/score/weekLabel'

const SCORES_KEY = 'craftcv:score:v1'
const HISTORY_KEY = 'craftcv:score:history:v1'
const HISTORY_CAP = 6

type PersistedScores = {
  schemaVersion: 1
  scoresByVersionId: Record<string, DashboardScoreResult>
}

type PersistedHistory = {
  schemaVersion: 1
  historyByVersionId: Record<string, ScoreHistoryEntry[]>
}

function loadScores(): Record<string, DashboardScoreResult> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(SCORES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<PersistedScores>
    if (parsed.schemaVersion !== 1) return {}
    return parsed.scoresByVersionId ?? {}
  } catch {
    return {}
  }
}

function saveScores(scoresByVersionId: Record<string, DashboardScoreResult>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistedScores = { schemaVersion: 1, scoresByVersionId }
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

function loadHistory(): Record<string, ScoreHistoryEntry[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<PersistedHistory>
    if (parsed.schemaVersion !== 1) return {}
    return parsed.historyByVersionId ?? {}
  } catch {
    return {}
  }
}

function saveHistory(historyByVersionId: Record<string, ScoreHistoryEntry[]>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistedHistory = { schemaVersion: 1, historyByVersionId }
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

function appendHistory(
  history: ScoreHistoryEntry[] | undefined,
  entry: ScoreHistoryEntry,
): ScoreHistoryEntry[] {
  const without = (history ?? []).filter((e) => e.weekIsoLabel !== entry.weekIsoLabel)
  const next = [...without, entry].sort((a, b) => a.scoredAt.localeCompare(b.scoredAt))
  if (next.length <= HISTORY_CAP) return next
  return next.slice(next.length - HISTORY_CAP)
}

export const useScoreStore = create<ScoreState>((set, get) => ({
  result: null,
  scoring: false,
  error: null,
  scoresByVersionId: {},
  historyByVersionId: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return
    const scores = loadScores()
    const history = loadHistory()
    const activeVersionId = useStore.getState().editor.activeVersionId
    const cached = activeVersionId ? scores[activeVersionId] ?? null : null
    set({
      scoresByVersionId: scores,
      historyByVersionId: history,
      result: cached,
      hydrated: true,
    })
  },

  runScore: async (force = false) => {
    const resumeStore = useStore.getState()
    const activeVersionId = resumeStore.editor.activeVersionId
    const activeVersion = resumeStore.versions[activeVersionId]
    if (!activeVersion) {
      set({ error: 'No active resume version. Upload a resume first.' })
      return
    }

    const cached = get().scoresByVersionId[activeVersionId]
    if (!force && cached) {
      const contentHash = computeContentHash(activeVersion.resume)
      if (!isStale(cached, contentHash)) {
        // Cache is fresh — use it
        set({ result: cached, error: null })
        return
      }
    }

    set({ scoring: true, error: null })
    try {
      const result = await runScore(activeVersion.resume)
      get().setResult(activeVersionId, result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown scoring error'
      set({ error: message })
    } finally {
      set({ scoring: false })
    }
  },

  setResult: (versionId, result) => {
    const scores = { ...get().scoresByVersionId, [versionId]: result }
    const history = { ...get().historyByVersionId }
    const entry: ScoreHistoryEntry = {
      weekIsoLabel: currentIsoWeekLabel(),
      score: result.overall,
      scoredAt: result.scoredAt,
    }
    history[versionId] = appendHistory(history[versionId], entry)

    set({
      scoresByVersionId: scores,
      historyByVersionId: history,
      result,
    })
    saveScores(scores)
    saveHistory(history)
  },

  clearError: () => set({ error: null }),
}))
