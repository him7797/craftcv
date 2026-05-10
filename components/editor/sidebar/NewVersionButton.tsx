'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'

export default function NewVersionButton() {
  const versions = useStore((s) => s.versions)
  const activeId = useStore((s) => s.editor.activeVersionId)
  const createVersion = useStore((s) => s.createVersion)
  const switchVersion = useStore((s) => s.switchVersion)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [branchFromId, setBranchFromId] = useState(activeId)
  const inputRef = useRef<HTMLInputElement | null>(null)

  function openDialog() {
    setName('')
    setBranchFromId(activeId)
    setOpen(true)
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  function submit() {
    const id = createVersion(name, branchFromId)
    if (id) {
      switchVersion(id)
      setOpen(false)
    }
  }

  const ordered = Object.values(versions).sort((a, b) => {
    if (a.id === 'master') return -1
    if (b.id === 'master') return 1
    return a.createdAt.localeCompare(b.createdAt)
  })

  return (
    <>
      <button
        type="button"
        className="editor-new-version"
        onClick={openDialog}
      >
        + NEW VERSION
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,13,13,0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--w)',
              border: 'var(--border)',
              boxShadow: 'var(--sh-lg)',
              padding: 28,
              width: 420,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: 1.5,
                color: '#888',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              NEW VERSION
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Branch a new resume version
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 1.2,
                  color: '#888',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                NAME
              </span>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit()
                  if (e.key === 'Escape') setOpen(false)
                }}
                placeholder="e.g. Backend roles"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  padding: '10px 12px',
                  border: 'var(--border)',
                  background: 'var(--w)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: 1.2,
                  color: '#888',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                BRANCH FROM
              </span>
              <select
                value={branchFromId}
                onChange={(e) => setBranchFromId(e.target.value)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  padding: '10px 12px',
                  border: 'var(--border)',
                  background: 'var(--w)',
                }}
              >
                {ordered.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="editor-btn-sm"
                onClick={() => setOpen(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="editor-btn-sm y"
                onClick={submit}
                disabled={!name.trim()}
              >
                CREATE VERSION
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
