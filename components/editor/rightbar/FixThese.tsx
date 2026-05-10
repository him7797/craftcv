'use client'

import FixItem from './FixItem'
import type { Fix, FixTarget } from '@/lib/types'

type Props = {
  fixes: Fix[]
  onJump: (target: FixTarget) => void
}

export default function FixThese({ fixes, onJump }: Props) {
  const open = fixes.filter((f) => f.state === 'open')
  const resolved = fixes.filter((f) => f.state === 'resolved')

  return (
    <div style={{ marginBottom: 28 }}>
      <div className="editor-score-h">FIX THESE</div>
      {open.length === 0 && resolved.length === 0 && (
        <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          Nothing to fix — nice.
        </div>
      )}
      <div className="editor-fix-list">
        {open.map((fix) => (
          <FixItem key={fix.id} fix={fix} onJump={onJump} />
        ))}
      </div>
      {resolved.length > 0 && (
        <>
          <hr className="editor-fix-divider" />
          <div className="editor-fix-list">
            {resolved.map((fix) => (
              <FixItem key={fix.id} fix={fix} onJump={onJump} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
