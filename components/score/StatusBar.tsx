'use client'

import { useEffect, useState } from 'react'
import { useScoreStore } from '@/lib/store/useScoreStore'
import { getActiveProvider, getModelLabel, getProviderLabel } from '@/lib/score/modelLabels'

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'NEVER'
  const diffMs = Date.now() - new Date(iso).getTime()
  const s = Math.max(0, Math.floor(diffMs / 1000))
  if (s < 5) return 'JUST NOW'
  if (s < 60) return `${s}S AGO`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} MIN AGO`
  const h = Math.floor(m / 60)
  return `${h} HR AGO`
}

export default function StatusBar() {
  const result = useScoreStore((s) => s.result)
  const scoring = useScoreStore((s) => s.scoring)
  const error = useScoreStore((s) => s.error)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const provider = getActiveProvider()
  const model = getModelLabel(provider)
  const providerLabel = getProviderLabel(provider)

  const lastScored = result ? `LAST SCORED ${relativeTime(result.scoredAt)}` : 'NEVER SCORED'
  const fixesRemaining = result
    ? result.actionItems.filter(
        (a: { priority: string }) => a.priority === 'P1' || a.priority === 'P2',
      ).length
    : 0

  let scoreSegment: React.ReactNode
  if (scoring) {
    scoreSegment = (
      <>
        SCORE: <b style={{ color: 'var(--y)' }}>...</b>
      </>
    )
  } else if (error && !result) {
    scoreSegment = (
      <>
        SCORE: <b style={{ color: 'var(--red)' }}>ERROR</b>
      </>
    )
  } else if (result) {
    scoreSegment = (
      <>
        SCORE: <b style={{ color: 'var(--y)' }}>{result.overall}/100</b>
      </>
    )
  } else {
    scoreSegment = <>SCORE: —</>
  }

  return (
    <footer className="editor-statusbar score-statusbar">
      <div>
        CRAFTCV <span style={{ color: '#444' }}>·</span> SCORE MODE{' '}
        <span style={{ color: '#444' }}>·</span> {lastScored}{' '}
        <span style={{ color: '#444' }}>·</span> {model}
      </div>
      <div>
        {scoreSegment}{' '}
        <span style={{ color: '#444' }}>·</span> {fixesRemaining} FIXES REMAINING{' '}
        <span style={{ color: '#444' }}>·</span> {providerLabel}
      </div>
    </footer>
  )
}
