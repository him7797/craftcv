import { useEffect, useState } from 'react'
import { computeScore } from './computeScore'
import { useStore } from '@/lib/store'
import type { Score } from '@/lib/types'

const EMPTY: Score = {
  overall: 0,
  band: 'needs-work',
  subScores: { impact: 0, language: 0, tailoring: 0, format: 0 },
  fixes: [],
}

export function useScore(): Score {
  const resume = useStore((s) => s.versions[s.editor.activeVersionId]?.resume ?? null)
  const [score, setScore] = useState<Score>(() =>
    resume ? computeScore(resume) : EMPTY,
  )

  useEffect(() => {
    if (!resume) return
    const id = setTimeout(() => setScore(computeScore(resume)), 250)
    return () => clearTimeout(id)
  }, [resume])

  return score
}
