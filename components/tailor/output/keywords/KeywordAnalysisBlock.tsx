'use client'

import type { AnalysisResult } from '@/lib/types'
import KeywordPill from './KeywordPill'

type Props = {
  result: AnalysisResult
  onMissingClick?: (keyword: string) => void
  smartCatchSlot?: React.ReactNode
}

export default function KeywordAnalysisBlock({
  result,
  onMissingClick,
  smartCatchSlot,
}: Props) {
  return (
    <div className="tailor-out-block">
      <div className="tailor-out-h">KEYWORD ANALYSIS</div>

      <div className="tailor-pill-section-h present">PRESENT IN YOUR RESUME ✓</div>
      <div className="tailor-pill-grid">
        {result.keywords.present.length === 0 ? (
          <span style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            (no matched keywords)
          </span>
        ) : (
          result.keywords.present.map((k) => (
            <KeywordPill key={`p-${k}`} keyword={k} variant="present" />
          ))
        )}
      </div>

      <div className="tailor-pill-section-h missing">MISSING FROM YOUR RESUME ↗</div>
      <div className="tailor-pill-grid">
        {result.keywords.missing.length === 0 ? (
          <span style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            (no gaps detected)
          </span>
        ) : (
          result.keywords.missing.map((k) => (
            <KeywordPill
              key={`m-${k}`}
              keyword={k}
              variant="missing"
              onClick={onMissingClick}
            />
          ))
        )}
      </div>

      {smartCatchSlot}
    </div>
  )
}
