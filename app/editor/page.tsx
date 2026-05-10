'use client'

import { Suspense, useEffect, useRef } from 'react'
import EditorShell from '@/components/editor/EditorShell'
import { loadSnapshot } from '@/lib/editor/autosave'
import { useStore } from '@/lib/store'
import { useRouter, useSearchParams } from 'next/navigation'
import { dispatchBlockRewrite, extractBlockContent } from '@/lib/editor/blockRewriteDispatch'
import type { BlockPath, BlockType } from '@/lib/types'

const VALID_BLOCK_TYPES: BlockType[] = [
  'experience-description',
  'project-block',
  'experience-bullets',
  'skills-section',
]

function parseBlockPath(blockType: BlockType, blockId: string): BlockPath | null {
  const idxNum = parseInt(blockId, 10)
  switch (blockType) {
    case 'experience-description':
      return isNaN(idxNum) ? null : { blockType: 'experience-description', expIndex: idxNum }
    case 'experience-bullets':
      return isNaN(idxNum) ? null : { blockType: 'experience-bullets', expIndex: idxNum, clientIndex: null }
    case 'project-block':
      return isNaN(idxNum) ? null : { blockType: 'project-block', projectIndex: idxNum }
    case 'skills-section':
      return { blockType: 'skills-section' }
  }
}

function DeepLinkHandler({ versionCount }: { versionCount: number }) {
  const searchParams = useSearchParams()
  const deepLinkFired = useRef(false)

  useEffect(() => {
    if (deepLinkFired.current || versionCount === 0) return
    const focus = searchParams.get('focus')
    if (!focus?.startsWith('rewrite:')) return

    deepLinkFired.current = true
    const parts = focus.split(':')
    if (parts.length < 3) return
    const blockType = parts[1] as BlockType
    if (!VALID_BLOCK_TYPES.includes(blockType)) return
    const blockId = parts.slice(2).join(':')

    setTimeout(() => {
      const blockPath = parseBlockPath(blockType, blockId)
      if (!blockPath) return

      const { versions, editor } = useStore.getState()
      const resume = versions[editor.activeVersionId]?.resume
      if (!resume) return

      const sourceContent = extractBlockContent(blockPath, resume)
      if (!sourceContent) return

      const btnId =
        blockType === 'skills-section'
          ? 'rewrite-btn-skills-section'
          : `rewrite-btn-${blockType}-${blockId}`
      document.getElementById(btnId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      dispatchBlockRewrite(blockPath, sourceContent)
    }, 300)
  }, [versionCount, searchParams])

  return null
}

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

  return (
    <>
      <EditorShell />
      <Suspense fallback={null}>
        <DeepLinkHandler versionCount={versionCount} />
      </Suspense>
    </>
  )
}
