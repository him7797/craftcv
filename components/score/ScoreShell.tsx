'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useScoreStore } from '@/lib/store/useScoreStore'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
import RewriteModal from '@/components/editor/workspace/blocks/RewriteModal'
import TopNav from './TopNav'
import StatusBar from './StatusBar'
import LeftColumn from './left/LeftColumn'
import CenterColumn from './center/CenterColumn'
import RightColumn from './right/RightColumn'

export default function ScoreShell() {
  const router = useRouter()
  const runScore = useScoreStore((s) => s.runScore)
  const rewriteSession = useBlockRewriteStore((s) => s.session)
  const toastVisible = useBlockRewriteStore((s) => s.toastVisible)
  const undoLastAccept = useBlockRewriteStore((s) => s.undoLastAccept)
  const dismissToast = useBlockRewriteStore((s) => s.dismissToast)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey

      const target = e.target as HTMLElement | null
      const inEditableField =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')

      if (meta && e.key.toLowerCase() === 'r' && !inEditableField) {
        e.preventDefault()
        runScore(true)
        return
      }

      if (meta && e.key.toLowerCase() === 'e' && !inEditableField) {
        e.preventDefault()
        router.push('/editor')
        return
      }

      if (meta && e.key.toLowerCase() === 'p' && !inEditableField) {
        e.preventDefault()
        router.push('/preview')
        return
      }

      if (meta && (e.key === '1' || e.key === '2' || e.key === '3') && !inEditableField) {
        const idx = parseInt(e.key, 10) - 1
        const versions = Object.values(useStore.getState().versions)
        const sorted = [...versions].sort((a, b) => {
          if (a.id === 'master') return -1
          if (b.id === 'master') return 1
          return a.createdAt.localeCompare(b.createdAt)
        })
        const target = sorted[idx]
        if (target) {
          e.preventDefault()
          useStore.getState().switchVersion(target.id)
        }
        return
      }

      if (!meta && (e.key === 'j' || e.key === 'k' || e.key === 'J' || e.key === 'K') && !inEditableField) {
        const cards = Array.from(document.querySelectorAll<HTMLElement>('.score-action-card'))
        if (cards.length === 0) return
        const active = document.activeElement as HTMLElement | null
        let idx = active ? cards.indexOf(active) : -1
        const dir = e.key.toLowerCase() === 'j' ? 1 : -1
        idx = ((idx + dir) % cards.length + cards.length) % cards.length
        e.preventDefault()
        cards[idx]?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router, runScore])

  return (
    <>
      <div className="score-shell">
        <TopNav />
        <div className="score-cols">
          <section className="score-col" aria-label="Score and sub-scores">
            <LeftColumn />
          </section>
          <div className="score-divider-v" aria-hidden />
          <section className="score-col" aria-label="Action items">
            <CenterColumn />
          </section>
          <div className="score-divider-v" aria-hidden />
          <section className="score-col" aria-label="Comparison and history">
            <RightColumn />
          </section>
        </div>
        <StatusBar />
      </div>
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
    </>
  )
}
