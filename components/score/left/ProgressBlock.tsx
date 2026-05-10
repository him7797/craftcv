'use client'

import { useScoreStore } from '@/lib/store/useScoreStore'
import ProgressCells from './ProgressCells'

export default function ProgressBlock() {
  const result = useScoreStore((s) => s.result)
  if (!result) return null

  const fixesRemaining = result.actionItems.filter(
    (a) => a.priority === 'P1' || a.priority === 'P2',
  ).length

  const subText =
    fixesRemaining === 0
      ? `${result.overall} / 100 — All key fixes complete`
      : `${result.overall} / 100 — ${fixesRemaining} fix${fixesRemaining === 1 ? '' : 'es'} away from 90+`

  return (
    <div className="score-block">
      <div className="score-block-h">PROGRESS</div>
      <ProgressCells score={result.overall} />
      <div className="score-progress-line">{subText}</div>
    </div>
  )
}
