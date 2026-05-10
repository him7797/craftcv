'use client'

import { useStore } from '@/lib/store'
import { useScoreStore } from '@/lib/store/useScoreStore'
import { relativeWeekLabel } from '@/lib/score/weekLabel'
import HistoryBar from './HistoryBar'

export default function HistoryBarChart() {
  const activeVersionId = useStore((s) => s.editor.activeVersionId)
  const historyByVersionId = useScoreStore((s) => s.historyByVersionId)
  const history = historyByVersionId[activeVersionId] ?? []

  const sorted = [...history].sort((a, b) => a.scoredAt.localeCompare(b.scoredAt))

  if (sorted.length === 0) {
    return (
      <>
        <div className="score-history-card">
          <HistoryBar score={null} label="NOW" isNow />
        </div>
        <div className="score-history-empty">
          Scores will appear here after your first run.
        </div>
      </>
    )
  }

  return (
    <div className="score-history-card">
      {sorted.map((entry, i) => {
        const isNow = i === sorted.length - 1
        const label = isNow ? 'NOW' : relativeWeekLabel(entry, sorted)
        return (
          <HistoryBar
            key={entry.weekIsoLabel}
            score={entry.score}
            label={label}
            isNow={isNow}
          />
        )
      })}
    </div>
  )
}
