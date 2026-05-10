'use client'

import EditorShell from '@/components/editor/EditorShell'
import { loadSnapshot } from '@/lib/editor/autosave'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function EditorPage() {
  const router = useRouter()
  const versionCount = useStore((s) => Object.keys(s.versions).length)
  const hydrated = useRef(false)

  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true

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
        Loading editor…
      </main>
    )
  }

  return <EditorShell />
}
