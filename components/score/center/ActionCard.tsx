'use client'

import type { ScoreActionItem } from '@/lib/types'
import { useScoreStore } from '@/lib/store/useScoreStore'
import ActionLink from './ActionLink'

const PRIORITY_LABEL: Record<ScoreActionItem['priority'], string> = {
  P1: 'P1 — HIGH IMPACT',
  P2: 'P2 — MEDIUM IMPACT',
  P3: 'P3 — LOW IMPACT',
  DONE: 'DONE ✓',
}

const PRIORITY_CLASS: Record<ScoreActionItem['priority'], string> = {
  P1: 'p1',
  P2: 'p2',
  P3: 'p3',
  DONE: 'done',
}

export default function ActionCard({ item }: { item: ScoreActionItem }) {
  const resolveActionItem = useScoreStore((s) => s.resolveActionItem)
  const cls = PRIORITY_CLASS[item.priority]
  return (
    <article className={`score-action-card ${cls}`} tabIndex={0}>
      <div className={`score-action-tag ${cls}`}>{PRIORITY_LABEL[item.priority]}</div>
      <div className="score-action-title">{item.title}</div>
      <div className="score-action-body">{item.body}</div>
      {item.priority !== 'DONE' && item.actionLabel && item.actionTarget && (
        <ActionLink
          label={item.actionLabel}
          target={item.actionTarget}
          onResolve={() => resolveActionItem(item.id)}
        />
      )}
    </article>
  )
}
