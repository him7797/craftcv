'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

export default function VersionList() {
  const versions = useStore((s) => s.versions)
  const activeId = useStore((s) => s.editor.activeVersionId)
  const switchVersion = useStore((s) => s.switchVersion)
  const renameVersion = useStore((s) => s.renameVersion)
  const deleteVersion = useStore((s) => s.deleteVersion)

  const [menuFor, setMenuFor] = useState<string | null>(null)

  const ordered = Object.values(versions).sort((a, b) => {
    if (a.id === 'master') return -1
    if (b.id === 'master') return 1
    return a.createdAt.localeCompare(b.createdAt)
  })

  function handleRename(id: string, currentName: string) {
    setMenuFor(null)
    const next = window.prompt('Rename version', currentName)
    if (next !== null && next.trim()) renameVersion(id, next)
  }

  function handleDelete(id: string, name: string) {
    setMenuFor(null)
    if (window.confirm(`Delete version "${name}"? This can't be undone.`)) {
      deleteVersion(id)
    }
  }

  return (
    <div>
      <div className="editor-side-h">RESUME VERSIONS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ordered.map((v) => {
          const isActive = v.id === activeId
          const isMaster = v.id === 'master'
          return (
            <div key={v.id} style={{ position: 'relative' }}>
              <button
                type="button"
                className={'editor-version' + (isActive ? ' active' : '')}
                onClick={() => switchVersion(v.id)}
                onContextMenu={(e) => {
                  if (isMaster) return
                  e.preventDefault()
                  setMenuFor(menuFor === v.id ? null : v.id)
                }}
              >
                {isActive && <span className="editor-version-pill">ACTIVE</span>}
                <span
                  className={'editor-version-name' + (isActive ? '' : ' muted')}
                  style={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  {v.name}
                </span>
              </button>
              {!isMaster && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuFor(menuFor === v.id ? null : v.id)
                  }}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    color: '#666',
                    cursor: 'pointer',
                    padding: '2px 6px',
                  }}
                  aria-label="More actions"
                >
                  ⋯
                </button>
              )}
              {menuFor === v.id && !isMaster && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: 'var(--w)',
                    border: 'var(--border)',
                    boxShadow: 'var(--sh)',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 120,
                  }}
                >
                  <button
                    type="button"
                    className="editor-bullet-btn"
                    style={{ border: 'none', textAlign: 'left' }}
                    onClick={() => handleRename(v.id, v.name)}
                  >
                    RENAME
                  </button>
                  <button
                    type="button"
                    className="editor-bullet-btn"
                    style={{ border: 'none', textAlign: 'left', color: 'var(--red)' }}
                    onClick={() => handleDelete(v.id, v.name)}
                  >
                    DELETE
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
