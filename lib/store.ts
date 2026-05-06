import { create } from 'zustand'
import type { Resume, ScoreResult } from './types'

interface CraftCVStore {
  resume: Resume | null
  score: ScoreResult | null
  topIssues: string[]
  setParseResult: (resume: Resume, score: ScoreResult) => void
  clearResume: () => void
}

export const useStore = create<CraftCVStore>((set) => ({
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
}))
