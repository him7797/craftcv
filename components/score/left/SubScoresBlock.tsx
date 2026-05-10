'use client'

import { useScoreStore } from '@/lib/store/useScoreStore'
import SubScoreRow from './SubScoreRow'

export default function SubScoresBlock() {
  const result = useScoreStore((s) => s.result)
  if (!result) return null

  return (
    <div className="score-block">
      <div className="score-block-h">SUB-SCORES</div>
      <SubScoreRow
        label="IMPACT"
        value={result.subscores.impact.score}
        explanation={result.subscores.impact.explanation}
      />
      <SubScoreRow
        label="LANGUAGE"
        value={result.subscores.language.score}
        explanation={result.subscores.language.explanation}
      />
      <SubScoreRow
        label="TAILORING"
        value={result.subscores.tailoring.score}
        explanation={result.subscores.tailoring.explanation}
      />
      <SubScoreRow
        label="FORMAT"
        value={result.subscores.format.score}
        explanation={result.subscores.format.explanation}
      />
      <SubScoreRow
        label="LENGTH"
        value={result.subscores.length.score}
        explanation={result.subscores.length.explanation}
      />
    </div>
  )
}
