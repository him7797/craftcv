'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useScoreStore } from '@/lib/store/useScoreStore'
import VersionComparisonRow from './VersionComparisonRow'

export default function VersionComparisonBlock() {
  const router = useRouter()
  const versions = useStore((s) => s.versions)
  const activeVersionId = useStore((s) => s.editor.activeVersionId)
  const switchVersion = useStore((s) => s.switchVersion)
  const scoresByVersionId = useScoreStore((s) => s.scoresByVersionId)

  const sorted = Object.values(versions).sort((a, b) => {
    if (a.id === 'master') return -1
    if (b.id === 'master') return 1
    return a.createdAt.localeCompare(b.createdAt)
  })

  return (
    <div className="score-block">
      <div className="score-block-h">VERSION COMPARISON</div>
      <div>
        {sorted.map((v) => (
          <VersionComparisonRow
            key={v.id}
            version={v}
            score={scoresByVersionId[v.id]?.overall ?? null}
            isActive={v.id === activeVersionId}
            onClick={() => {
              switchVersion(v.id)
              router.push('/editor')
            }}
          />
        ))}
      </div>
    </div>
  )
}
