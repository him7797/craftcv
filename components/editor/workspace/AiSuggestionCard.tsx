'use client'

import { useEffect, useRef, useState } from 'react'
import BulletText from './BulletText'
import { cancelActiveStream, dispatchRetry } from '@/lib/editor/aiDispatch'
import { useStore } from '@/lib/store'

export default function AiSuggestionCard() {
  const session = useStore((s) => s.editor.aiSession)
  const acceptAiSuggestion = useStore((s) => s.acceptAiSuggestion)
  const skipAiSession = useStore((s) => s.skipAiSession)
  const updateBullet = useStore((s) => s.updateBullet)
  const addBullet = useStore((s) => s.addBullet)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (editing) requestAnimationFrame(() => taRef.current?.focus())
  }, [editing])

  if (!session) return null

  const streaming = session.streaming
  const suggestion = session.suggestion
  const error = session.error

  function onAccept() {
    if (editing) {
      const trimmed = draft.trim()
      if (!trimmed) {
        skipAiSession()
        setEditing(false)
        return
      }
      if ('section' in session!.target && session!.target.section === 'new-bullet') {
        addBullet(session!.target.parent, trimmed)
      } else {
        updateBullet(session!.target, trimmed)
      }
      skipAiSession()
      setEditing(false)
      return
    }
    acceptAiSuggestion()
    setEditing(false)
  }

  function onEdit() {
    setDraft(suggestion)
    setEditing(true)
  }

  function onSkip() {
    cancelActiveStream()
    skipAiSession()
    setEditing(false)
  }

  function onRetry() {
    setEditing(false)
    dispatchRetry()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onAccept()
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onSkip()
    }
  }

  return (
    <div className="editor-ai-card">
      <div className="editor-ai-head">
        <span className="square" />
        <span>AI SUGGESTION{streaming ? ' · streaming…' : ''}</span>
      </div>
      <div className="editor-ai-body">
        {editing ? (
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            style={{
              width: '100%',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              lineHeight: 1.55,
              border: '2px solid var(--b)',
              padding: '8px 10px',
              background: 'var(--w)',
              color: 'var(--b)',
              resize: 'vertical',
              minHeight: 60,
            }}
          />
        ) : suggestion ? (
          <BulletText source={suggestion} />
        ) : streaming ? (
          <span style={{ color: '#888' }}>Working…</span>
        ) : (
          <span style={{ color: '#888' }}>No suggestion yet.</span>
        )}
      </div>
      {error && (
        <div
          style={{
            color: 'var(--red)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            marginBottom: 8,
          }}
        >
          {error}
        </div>
      )}
      <div className="editor-ai-actions">
        <button
          type="button"
          className="editor-btn-sm y"
          onClick={onAccept}
          disabled={streaming || (!suggestion && !editing)}
        >
          ACCEPT
        </button>
        <button
          type="button"
          className="editor-btn-sm"
          onClick={onEdit}
          disabled={streaming || !suggestion || editing}
        >
          EDIT
        </button>
        <button type="button" className="editor-btn-sm" onClick={onSkip}>
          SKIP
        </button>
        <span className="spacer" />
        <button
          type="button"
          className="editor-btn-sm"
          onClick={onRetry}
          disabled={streaming || session.retriesLeft <= 0}
          title={
            session.retriesLeft <= 0
              ? 'No retries left'
              : `${session.retriesLeft} retries left`
          }
        >
          RETRY ↻ ({session.retriesLeft})
        </button>
      </div>
    </div>
  )
}
