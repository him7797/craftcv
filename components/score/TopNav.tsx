'use client'

import Link from 'next/link'
import { useScoreStore } from '@/lib/store/useScoreStore'

export default function TopNav() {
  const scoring = useScoreStore((s) => s.scoring)
  const runScore = useScoreStore((s) => s.runScore)

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
        <Link href="/tailor" className="editor-tab">TAILOR</Link>
        <button className="editor-tab active" disabled>SCORE</button>
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          className="btn btn-w"
          disabled={scoring}
          onClick={() => runScore(true)}
        >
          {scoring ? 'SCORING...' : 'RE-SCORE ↻'}
        </button>
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
