'use client'

import { useEffect } from 'react'
import RewriteModalHeader from './RewriteModalHeader'
import RewriteModalFooter from './RewriteModalFooter'
import RewriteDiffView from './RewriteDiffView'
import EditInPlaceForm from './EditInPlaceForm'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
import { dispatchBlockRetry, cancelBlockRewrite } from '@/lib/editor/blockRewriteDispatch'
import type { BlockContent, RetryHint } from '@/lib/types'

function getBlockLabel(session: NonNullable<ReturnType<typeof useBlockRewriteStore.getState>['session']>): string {
  const bp = session.blockPath
  switch (bp.blockType) {
    case 'experience-description':
      return ''
    case 'experience-bullets':
      return bp.clientIndex !== null ? `client ${bp.clientIndex + 1}` : ''
    case 'project-block':
      return session.suggestion?.before.blockType === 'project-block'
        ? (session.suggestion.before as Extract<BlockContent, { blockType: 'project-block' }>).name
        : ''
    case 'skills-section':
      return ''
  }
}

export default function RewriteModal() {
  const session = useBlockRewriteStore((s) => s.session)
  const acceptSuggestion = useBlockRewriteStore((s) => s.acceptSuggestion)
  const rejectSuggestion = useBlockRewriteStore((s) => s.rejectSuggestion)
  const enterEditMode = useBlockRewriteStore((s) => s.enterEditMode)
  const saveEdit = useBlockRewriteStore((s) => s.saveEdit)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && session) {
        cancelBlockRewrite()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [session])

  if (!session) return null

  const blockLabel = getBlockLabel(session)

  function handleRetry(hint: RetryHint) {
    dispatchBlockRetry(hint)
  }

  function handleAccept() {
    acceptSuggestion()
  }

  function handleReject() {
    rejectSuggestion()
  }

  function handleEditInPlace() {
    enterEditMode()
  }

  function handleSaveEdit(edited: BlockContent) {
    saveEdit(edited)
  }

  const editContent = session.suggestion?.after ?? null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) cancelBlockRewrite()
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '2px solid #000',
          boxShadow: '6px 6px 0 #000',
          width: '80vw',
          maxWidth: 1200,
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <RewriteModalHeader
          blockType={session.blockPath.blockType}
          blockLabel={blockLabel}
          onClose={cancelBlockRewrite}
        />

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {session.error ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#C42B2B', marginBottom: 16 }}>
                  ⚠ {session.error}
                </div>
                <button
                  type="button"
                  onClick={() => handleRetry('different-angle')}
                  disabled={session.retriesLeft <= 0}
                  style={{
                    fontFamily: 'monospace', fontSize: 11, padding: '8px 16px',
                    background: '#fff', border: '2px solid #000', cursor: session.retriesLeft <= 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  RETRY ↻
                </button>
              </div>
            </div>
          ) : session.editMode && editContent ? (
            <EditInPlaceForm
              blockType={session.blockPath.blockType}
              initialContent={editContent}
              onSave={handleSaveEdit}
              onCancel={() => useBlockRewriteStore.getState().enterEditMode()}
            />
          ) : (
            <>
              {session.suggestion?.warning && (
                <div
                  style={{
                    background: '#FFF9C4',
                    borderBottom: '1px solid #FFD600',
                    padding: '8px 20px',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: '#7a5c00',
                    flexShrink: 0,
                  }}
                >
                  ⚠ AI suggestion may not fully match guidelines. Review carefully before accepting.
                </div>
              )}
              <RewriteDiffView session={session} />
            </>
          )}
        </div>

        <RewriteModalFooter
          streaming={session.streaming}
          provider="ollama"
          model="qwen2.5:14b"
          jdActive={false}
          jdName=""
          jdTooShort={false}
          retriesLeft={session.retriesLeft}
          onAccept={handleAccept}
          onEditInPlace={handleEditInPlace}
          onReject={handleReject}
          onRetry={handleRetry}
          hasError={!!session.error}
          hasSuggestion={!!session.suggestion}
        />
      </div>
    </div>
  )
}
