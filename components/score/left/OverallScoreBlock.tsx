'use client'

import { useScoreStore } from '@/lib/store/useScoreStore'
import { getModelLabel, getProviderLabel } from '@/lib/score/modelLabels'

export default function OverallScoreBlock() {
  const result = useScoreStore((s) => s.result)
  const scoring = useScoreStore((s) => s.scoring)

  if (scoring && !result) {
    return (
      <div className="score-block">
        <div className="score-block-h">OVERALL SCORE</div>
        <div className="score-overall-row">
          <div className="score-overall-box">
            <div className="score-overall-num" style={{ opacity: 0.4 }}>...</div>
            <div className="score-overall-num-suffix">/100</div>
          </div>
          <div>
            <div className="score-verdict" style={{ opacity: 0.4 }}>...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="score-block">
        <div className="score-block-h">OVERALL SCORE</div>
        <div className="score-overall-row">
          <div className="score-overall-box">
            <div className="score-overall-num">—</div>
            <div className="score-overall-num-suffix">/100</div>
          </div>
          <div>
            <div className="score-verdict">NOT YET SCORED</div>
            <div className="score-verdict-body">Click RE-SCORE ↻ to compute your score.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="score-block">
      <div className="score-block-h">OVERALL SCORE</div>
      <div className="score-overall-row">
        <div className="score-overall-box">
          <div className="score-overall-num">{result.overall}</div>
          <div className="score-overall-num-suffix">/100</div>
        </div>
        <div>
          <div className="score-verdict">{result.band}</div>
          <div className="score-verdict-body">{result.verdictText}</div>
        </div>
      </div>
      <div className="score-meta-line">
        SCORED BY {getModelLabel(result.provider)} · {getProviderLabel(result.provider)}
      </div>
    </div>
  )
}
