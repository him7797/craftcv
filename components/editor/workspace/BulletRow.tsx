'use client'

import { useEffect, useRef, useState } from 'react'
import BulletText from './BulletText'
import { bulletElementId } from '@/lib/editor/bulletId'
import { useStore } from '@/lib/store'
import type { BulletPath } from '@/lib/types'

type Props = {
  path: BulletPath
  text: string
  muted?: boolean
  onRequestAi?: () => void
}

export default function BulletRow({ path, text, muted, onRequestAi }: Props) {
  const updateBullet = useStore((s) => s.updateBullet)
  const deleteBullet = useStore((s) => s.deleteBullet)
  const reorderBullets = useStore((s) => s.reorderBullets)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (editing) requestAnimationFrame(() => taRef.current?.focus())
  }, [editing])

  function startEdit() {
    setDraft(text)
    setEditing(true)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== text) updateBullet(path, trimmed)
    setEditing(false)
  }

  function cancel() {
    setEditing(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      commit()
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  return (
    <div className="editor-bullet" id={bulletElementId(path)}>
      <div className="editor-bullet-glyph" />
      {editing ? (
        <textarea
          ref={taRef}
          className="editor-bullet-edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          rows={2}
        />
      ) : (
        <div className={'editor-bullet-text' + (muted ? ' muted' : '')}>
          <BulletText source={text} />
        </div>
      )}
      <div className="editor-bullet-actions">
        {!editing && (
          <>
            <button
              type="button"
              className="editor-bullet-btn b"
              onClick={() => onRequestAi?.()}
              title="Rewrite with AI"
            >
              AI ✦
            </button>
            <button
              type="button"
              className="editor-bullet-btn"
              onClick={startEdit}
            >
              EDIT
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                className="editor-bullet-btn"
                onClick={() => reorderBullets(path, 'up')}
                title="Move up"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="editor-bullet-btn"
                onClick={() => reorderBullets(path, 'down')}
                title="Move down"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="editor-bullet-btn"
                onClick={() => deleteBullet(path)}
                title="Delete"
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          </>
        )}
        {editing && (
          <>
            <button type="button" className="editor-bullet-btn b" onMouseDown={(e) => e.preventDefault()} onClick={commit}>
              SAVE
            </button>
            <button type="button" className="editor-bullet-btn" onMouseDown={(e) => e.preventDefault()} onClick={cancel}>
              CANCEL
            </button>
          </>
        )}
      </div>
    </div>
  )
}
