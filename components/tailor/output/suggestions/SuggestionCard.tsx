'use client'

import type { LanguageSuggestion } from '@/lib/types'
import ArrowDivider from './ArrowDivider'

type Props = {
  suggestion: LanguageSuggestion
  onClick?: (suggestion: LanguageSuggestion) => void
}

export default function SuggestionCard({ suggestion, onClick }: Props) {
  return (
    <div
      className="tailor-suggestion-card"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={() => onClick?.(suggestion)}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(suggestion)
        }
      }}
    >
      <div className="tailor-suggestion-label">YOUR RESUME SAYS</div>
      <div className="tailor-suggestion-phrase">&ldquo;{suggestion.resumeSays}&rdquo;</div>
      <ArrowDivider />
      <div className="tailor-suggestion-label">JD LANGUAGE</div>
      <div className="tailor-suggestion-phrase">&ldquo;{suggestion.jdLanguage}&rdquo;</div>
      {suggestion.rationale && (
        <div className="tailor-suggestion-rationale">{suggestion.rationale}</div>
      )}
    </div>
  )
}
