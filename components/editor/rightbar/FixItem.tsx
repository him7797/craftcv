'use client'

import type { Fix, FixTarget } from '@/lib/types'

type Props = {
  fix: Fix
  onJump: (target: FixTarget) => void
}

export default function FixItem({ fix, onJump }: Props) {
  if (fix.state === 'resolved') {
    return (
      <div className="editor-fix resolved">
        <span className="icon">✓</span>
        <span>{fix.message}</span>
      </div>
    )
  }

  const clickable = !!fix.target
  return (
    <button
      type="button"
      className="editor-fix open"
      onClick={() => fix.target && onJump(fix.target)}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      disabled={!clickable}
    >
      <span className="icon">!</span>
      <span className="body">
        {fix.message}
        {fix.hint && <span className="hint">{fix.hint}</span>}
      </span>
    </button>
  )
}
