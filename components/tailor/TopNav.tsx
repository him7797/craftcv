'use client'

import Link from 'next/link'

export default function TopNav() {
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
        <Link href="/editor" className="editor-tab">EDITOR</Link>
        <Link href="/preview" className="editor-tab">PREVIEW</Link>
        <button className="editor-tab active" disabled>TAILOR</button>
        <Link href="/score" className="editor-tab">SCORE</Link>
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
