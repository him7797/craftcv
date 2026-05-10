'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { loadSnapshot } from '@/lib/editor/autosave'
import PreviewShell from '@/components/preview/PreviewShell'

export default function PreviewPage() {
  const router = useRouter()
  const versionCount = useStore((s) => Object.keys(s.versions).length)
  const hydrated = useRef(false)

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

    if (Object.keys(useStore.getState().versions).length > 0) return

    const snapshot = loadSnapshot()
    if (snapshot) {
      useStore.getState().hydrateFromSnapshot(snapshot)
      return
    }

    const { resume, initFromUpload } = useStore.getState()
    if (resume) {
      initFromUpload()
      return
    }

    router.replace('/upload')
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
        Loading preview…
      </main>
    )
  }

  return <PreviewShell />
}
