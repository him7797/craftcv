'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const s = Math.max(0, Math.floor(diffMs / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `saved ${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `saved ${m}m ago`
  const h = Math.floor(m / 60)
  return `saved ${h}h ago`
}

export default function TopNav({ flash }: { flash?: boolean }) {
  const lastSavedAt = useStore((s) => s.editor.lastSavedAt)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="editor-topnav">
      <div className="logo">
        <div className="logo-icon">
          <div className="logo-pixel">
            <span /><span /><span />
            <span /><span /><span />
            <span /><span /><span />
          </div>
        </div>
        <span className="logo-text">CRAFTCV</span>
        <span className="logo-badge">BETA</span>
      </div>

      <div className="editor-tabs">
        <button className="editor-tab active" disabled>EDITOR</button>
        <Link href="/preview" className="editor-tab">PREVIEW</Link>
        <Link href="/tailor" className="editor-tab">TAILOR</Link>
        <Link href="/score" className="editor-tab">SCORE</Link>
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className={'editor-saved' + (flash ? ' flash' : '')}>
          {relativeTime(lastSavedAt).toUpperCase()}
        </span>
        <button
          type="button"
          className="btn btn-w"
          onClick={() => window.print()}
        >
          PREVIEW PDF
        </button>
        <button
          type="button"
          className="btn btn-y"
          onClick={() => window.print()}
        >
          EXPORT PDF
        </button>
      </div>
    </header>
  )
}
