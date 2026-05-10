'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useScoreStore } from '@/lib/store/useScoreStore'
import { loadSnapshot } from '@/lib/editor/autosave'
import ScoreShell from '@/components/score/ScoreShell'

export default function ScorePage() {
  const router = useRouter()
  const versionCount = useStore((s) => Object.keys(s.versions).length)
  const hydrated = useRef(false)

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    useScoreStore.getState().hydrate()

    if (Object.keys(useStore.getState().versions).length === 0) {
      const snapshot = loadSnapshot()
      if (snapshot) {
        useStore.getState().hydrateFromSnapshot(snapshot)
      } else {
        const { resume, initFromUpload } = useStore.getState()
        if (resume) {
          initFromUpload()
        } else {
          router.replace('/upload')
          return
        }
      }
    }

    // Auto-run a score on first visit (or when stale). The store handles
    // staleness internally via cache check + content-hash comparison.
    void useScoreStore.getState().runScore(false)
  }, [router])

  if (versionCount === 0) {
    return (
      <main
        style={{
          height: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 1.5,
          color: '#888',
          textTransform: 'uppercase',
        }}
      >
        Loading score…
      </main>
    )
  }

  return <ScoreShell />
}
