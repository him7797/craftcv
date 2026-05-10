'use client'

import type { LanguageSuggestion } from '@/lib/types'
import SuggestionCard from './SuggestionCard'

type Props = {
  suggestions: LanguageSuggestion[]
  onSuggestionClick?: (suggestion: LanguageSuggestion) => void
}

export default function LanguageSuggestionsBlock({
  suggestions,
  onSuggestionClick,
}: Props) {
  if (suggestions.length === 0) return null
  return (
    <div className="tailor-out-block">
      <div className="tailor-out-h">LANGUAGE SUGGESTIONS</div>
      {suggestions.map((s, i) => (
        <SuggestionCard
          key={`${s.resumeSays.slice(0, 24)}-${i}`}
          suggestion={s}
          onClick={onSuggestionClick}
        />
      ))}
    </div>
  )
}
