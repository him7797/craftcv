import { useEffect, useState } from 'react'
import { computeScore } from './computeScore'
import { computeContentHash } from '@/lib/score/computeScore'
import { useStore } from '@/lib/store'
import { useScoreStore } from '@/lib/store/useScoreStore'
import type { DashboardScoreResult, Score } from '@/lib/types'

const EMPTY: Score = {
  overall: 0,
  band: 'needs-work',
  subScores: { impact: 0, language: 0, tailoring: 0, format: 0 },
  fixes: [],
}

function blendStoreResult(result: DashboardScoreResult, localScore: Score): Score {
  const band: Score['band'] =
    result.band === 'GREAT' ? 'great' : result.band === 'GOOD' ? 'good' : 'needs-work'
  return {
    overall: result.overall,
    band,
    subScores: {
      impact: result.subscores.impact.score,
      language: result.subscores.language.score,
      tailoring: result.subscores.tailoring.score,
      format: result.subscores.format.score,
    },
    fixes: localScore.fixes,
  }
}

export function useScore(): Score {
  const resume = useStore((s) => s.versions[s.editor.activeVersionId]?.resume ?? null)
  const storeResult = useScoreStore((s) => s.result)

  const [local, setLocal] = useState<Score>(() =>
    resume ? computeScore(resume) : EMPTY,
  )

  useEffect(() => {
    if (!resume) return
    const localTimer = setTimeout(() => setLocal(computeScore(resume)), 250)
    const storeTimer = setTimeout(() => {
      const hash = computeContentHash(resume)
      const cached = useScoreStore.getState().result
      if (!cached || cached.scoredContentHash !== hash) {
        void useScoreStore.getState().runScore()
      }
    }, 2000)
    return () => {
      clearTimeout(localTimer)
      clearTimeout(storeTimer)
    }
  }, [resume])

  if (storeResult && resume) {
    const hash = computeContentHash(resume)
    if (storeResult.scoredContentHash === hash) {
      return blendStoreResult(storeResult, local)
    }
  }

  return local
}
