'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LeftSidebar from './sidebar/LeftSidebar'
import RightSidebar from './rightbar/RightSidebar'
import SectionWorkspace from './workspace/SectionWorkspace'
import StatusBar from './StatusBar'
import TopNav from './TopNav'
import { cancelActiveStream } from '@/lib/editor/aiDispatch'
import { useStore } from '@/lib/store'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
import RewriteModal from './workspace/blocks/RewriteModal'
import type { EditorSection } from '@/lib/types'

const SECTION_ORDER: EditorSection[] = [
  'experience',
  'skills',
  'education',
  'projects',
  'header',
]

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true
  if (target.isContentEditable) return true
  return false
}

function focusLastNewBulletInput() {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    '.editor-new-bullet input',
  )
  const last = inputs[inputs.length - 1]
  if (last) last.focus()
}

export default function EditorShell() {
  const router = useRouter()
  const [savedFlash, setSavedFlash] = useState(false)
  const rewriteSession = useBlockRewriteStore((s) => s.session)
  const toastVisible = useBlockRewriteStore((s) => s.toastVisible)
  const undoLastAccept = useBlockRewriteStore((s) => s.undoLastAccept)
  const dismissToast = useBlockRewriteStore((s) => s.dismissToast)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const cmd = event.metaKey || event.ctrlKey

      // ⌘+S — force save
      if (cmd && event.key === 's') {
        event.preventDefault()
        useStore.getState().forceSave()
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 200)
        return
      }

      // ⌘+P — preview
      if (cmd && event.key === 'p') {
        event.preventDefault()
        router.push('/preview')
        return
      }

      // ⌘+K — focus latest new-bullet input
      if (cmd && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        focusLastNewBulletInput()
        return
      }

      // Esc — cancel AI session if any
      if (event.key === 'Escape') {
        const session = useStore.getState().editor.aiSession
        if (session) {
          event.preventDefault()
          cancelActiveStream()
          useStore.getState().skipAiSession()
        }
        return
      }

      // 1–5 — section jump (only when not typing)
      if (!cmd && /^[1-5]$/.test(event.key) && !isTypingTarget(event.target)) {
        const idx = parseInt(event.key, 10) - 1
        const target = SECTION_ORDER[idx]
        if (target) {
          event.preventDefault()
          useStore.getState().setActiveSection(target)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <div className="editor-shell">
      <TopNav flash={savedFlash} />
      <div className="editor-cols">
        <LeftSidebar />
        <SectionWorkspace />
        <RightSidebar />
      </div>
      <StatusBar />
      {rewriteSession && <RewriteModal />}
      {toastVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#fff',
            border: '2px solid #000',
            boxShadow: '3px 3px 0 #000',
            padding: '12px 18px',
            fontFamily: 'monospace',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 200,
          }}
        >
          Block updated. Score will refresh.
          <button
            type="button"
            onClick={() => { undoLastAccept(); dismissToast() }}
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              color: '#000',
            }}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={dismissToast}
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#888',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
