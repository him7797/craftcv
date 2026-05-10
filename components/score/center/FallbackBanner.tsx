'use client'

import { useScoreStore } from '@/lib/store/useScoreStore'

export default function FallbackBanner() {
  const result = useScoreStore((s) => s.result)
  const runScore = useScoreStore((s) => s.runScore)
  const clearError = useScoreStore((s) => s.clearError)

  if (!result || result.aiAvailable) return null

  return (
    <div className="score-fallback-banner" role="alert">
      <div className="score-fallback-banner-label">⚠ AI SCORING UNAVAILABLE</div>
      <div className="score-fallback-banner-body">
        <span>Showing rule-based results only.</span>
        <button
          type="button"
          className="btn btn-w"
          style={{ fontSize: 10 }}
          onClick={() => {
            clearError()
            runScore(true)
          }}
        >
          RETRY
        </button>
      </div>
    </div>
  )
}
