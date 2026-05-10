'use client'

import type { Version } from '@/lib/types'

type Props = {
  version: Version
  isActive: boolean
  onClick: () => void
}

export default function VersionChip({ version, isActive, onClick }: Props) {
  return (
    <button
      type="button"
      className={`preview-chip${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      {labelFor(version)}
    </button>
  )
}

function labelFor(version: Version): string {
  if (version.id === 'master') return 'MASTER'
  return version.name.toUpperCase()
}
