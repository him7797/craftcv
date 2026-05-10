'use client'

import { useRouter } from 'next/navigation'
import { useTailorStore } from '@/lib/store/useTailorStore'
import { buildBulletFocusUrl, buildKeywordFocusUrl } from '@/lib/tailor/handoff'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'
import MatchScoreBlock from './matchScore/MatchScoreBlock'
import KeywordAnalysisBlock from './keywords/KeywordAnalysisBlock'
import SmartCatchNote from './keywords/SmartCatchNote'
import LanguageSuggestionsBlock from './suggestions/LanguageSuggestionsBlock'

export default function OutputColumn() {
  const router = useRouter()
  const result = useTailorStore((s) => s.result)
  const analysing = useTailorStore((s) => s.analysing)
  const error = useTailorStore((s) => s.error)
  const draftJdText = useTailorStore((s) => s.draftJdText)
  const activeProfileId = useTailorStore((s) => s.activeProfileId)

  if (analysing) return <LoadingSkeleton />

  if (error && !result) {
    return (
      <div className="tailor-empty">
        <div className="tailor-empty-inner">
          <div
            className="tailor-empty-icon"
            style={{ background: 'var(--red)', color: 'var(--w)' }}
          >
            !
          </div>
          <div className="tailor-empty-h">ANALYSIS FAILED</div>
          <div className="tailor-empty-sub">{error}</div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <>
        <MatchScoreBlock result={result} />
        <KeywordAnalysisBlock
          result={result}
          onMissingClick={(k) => router.push(buildKeywordFocusUrl(k))}
          smartCatchSlot={<SmartCatchNote catches={result.smartCatches} />}
        />
        <LanguageSuggestionsBlock
          suggestions={result.languageSuggestions}
          onSuggestionClick={(s) => router.push(buildBulletFocusUrl(s.resumeSays))}
        />
      </>
    )
  }

  if (!draftJdText && !activeProfileId) return <EmptyState />
  return <EmptyState />
}
