'use client'

import { useStore } from '@/lib/store'
import VersionChip from './VersionChip'

export default function VersionChips() {
  const versions = useStore((s) => s.versions)
  const activeVersionId = useStore((s) => s.editor.activeVersionId)
  const switchVersion = useStore((s) => s.switchVersion)

  // Master first, then user versions in createdAt order
  const sorted = Object.values(versions).sort((a, b) => {
    if (a.id === 'master') return -1
    if (b.id === 'master') return 1
    return a.createdAt.localeCompare(b.createdAt)
  })

  return (
    <>
      {sorted.map((v) => (
        <VersionChip
          key={v.id}
          version={v}
          isActive={v.id === activeVersionId}
          onClick={() => switchVersion(v.id)}
        />
      ))}
    </>
  )
}
