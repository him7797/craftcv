'use client'

import { useScoreStore } from '@/lib/store/useScoreStore'
import ActionCard from './ActionCard'
import FallbackBanner from './FallbackBanner'
import ScoringLoadingState from './ScoringLoadingState'

export default function ActionItemsList() {
  const result = useScoreStore((s) => s.result)
  const scoring = useScoreStore((s) => s.scoring)
  const error = useScoreStore((s) => s.error)

  if (scoring) return <ScoringLoadingState />

  if (error && !result) {
    return (
      <div className="score-loading">
        <span className="score-loading-text" style={{ color: 'var(--red)' }}>
          ⚠ Scoring failed: {error}
        </span>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="score-loading">
        <span className="score-loading-text">Click RE-SCORE ↻ to begin.</span>
      </div>
    )
  }

  return (
    <>
      <div className="score-block-h" style={{ marginBottom: 24 }}>
        ACTION ITEMS
      </div>
      <FallbackBanner />
      <div className="score-action-list">
        {result.actionItems.map((item) => (
          <ActionCard key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}
