'use client'

import SubScoreRow from './SubScoreRow'
import type { Score } from '@/lib/types'

const STATUS: Record<Score['band'], string> = {
  great: 'Great — ready to send',
  good: 'Good — keep improving',
  'needs-work': 'Needs work — fix the basics',
}

export default function ResumeScoreBlock({ score }: { score: Score }) {
  return (
    <div className="editor-score-block">
      <div className="editor-score-h">RESUME SCORE</div>
      <div className="editor-score-num">
        {score.overall}
        <small>/100</small>
      </div>
      <div className="editor-score-status">{STATUS[score.band]}</div>
      <SubScoreRow label="IMPACT" value={score.subScores.impact} />
      <SubScoreRow label="LANGUAGE" value={score.subScores.language} />
      <SubScoreRow label="TAILORING" value={score.subScores.tailoring} />
      <SubScoreRow label="FORMAT" value={score.subScores.format} />
    </div>
  )
}
