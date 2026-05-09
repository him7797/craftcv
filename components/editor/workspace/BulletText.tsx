'use client'

import { tokenize } from '@/lib/editor/bulletParser'
import type { BulletToken } from '@/lib/types'

export default function BulletText({ source }: { source: string }) {
  const tokens = tokenize(source)
  return (
    <span className="editor-bullet-text">
      {tokens.map((token, idx) => renderToken(token, idx))}
    </span>
  )
}

function renderToken(token: BulletToken, idx: number) {
  if (token.kind === 'text') return <span key={idx}>{token.value}</span>
  if (token.kind === 'metric')
    return (
      <span key={idx} className="editor-pill-metric">
        {token.value}
      </span>
    )
  if (token.kind === 'tech')
    return (
      <span key={idx} className="editor-pill-tech">
        {token.value}
      </span>
    )
  return (
    <span key={idx} className="editor-pill-italic">
      {token.value}
    </span>
  )
}
