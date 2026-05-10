'use client'

import type { Version } from '@/lib/types'

type Props = {
  version: Version
  score: number | null
  isActive: boolean
  onClick: () => void
}

function colorClass(score: number | null): string {
  if (score === null) return 'empty'
  if (score >= 90) return 'green'
  if (score >= 80) return 'amber'
  return 'black'
}

export default function VersionComparisonRow({ version, score, isActive, onClick }: Props) {
  return (
    <button
      type="button"
      className="score-version-row"
      onClick={onClick}
      disabled={isActive}
    >
      <span className="score-version-name">
        {labelFor(version)}
        {isActive && <span className="score-version-active">ACTIVE</span>}
      </span>
      <span className={`score-version-num ${colorClass(score)}`}>
        {score === null ? '—' : score}
      </span>
    </button>
  )
}

function labelFor(version: Version): string {
  if (version.id === 'master') return 'MASTER RESUME'
  return version.name.toUpperCase()
}
