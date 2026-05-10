'use client'

import Link from 'next/link'

export default function TopNav() {
  return (
    <header className="editor-topnav preview-topnav">
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
        <Link href="/editor" className="editor-tab">EDITOR</Link>
        <button className="editor-tab active" disabled>PREVIEW</button>
        <Link href="/tailor" className="editor-tab">TAILOR</Link>
        <Link href="/score" className="editor-tab">SCORE</Link>
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/editor" className="btn btn-w">
          ← BACK TO EDITOR
        </Link>
        <button
          type="button"
          className="btn btn-y"
          onClick={() => window.print()}
        >
          EXPORT PDF ↓
        </button>
      </div>
    </header>
  )
}
