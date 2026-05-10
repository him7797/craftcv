'use client'

import type { DiffAnnotation } from '@/lib/types'

type Category = { category: string; items: string[] }

type Props = {
  before: Category[]
  after: Category[]
  diff: DiffAnnotation
}

export default function DiffSkillsGrid({ before, after, diff }: Props) {
  const removedCategories = new Set(
    before
      .filter((b) => !after.find((a) => a.category === b.category))
      .map((b) => b.category),
  )
  const addedCategories = new Set(
    after
      .filter((a) => !before.find((b) => b.category === a.category))
      .map((a) => a.category),
  )

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
      {/* BEFORE column */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#555', marginBottom: 12 }}>
          BEFORE
        </div>
        {before.map((cat, i) => {
          const isRemoved = removedCategories.has(cat.category)
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: isRemoved ? '#C42B2B' : '#111',
                  textDecoration: isRemoved ? 'line-through' : undefined,
                  marginBottom: 3,
                }}
              >
                {isRemoved && (
                  <span style={{ background: '#C42B2B', color: '#fff', fontSize: 9, padding: '1px 4px', marginRight: 6 }}>
                    – REMOVED
                  </span>
                )}
                {cat.category}
              </div>
              <div style={{ fontSize: 13, color: '#444' }}>
                {cat.items.map((item, j) => {
                  const isItemRemoved = diff.removed.some((r) => r.toLowerCase() === item.toLowerCase())
                  return (
                    <span
                      key={j}
                      style={{
                        display: 'inline-block',
                        marginRight: 6,
                        color: isItemRemoved ? '#C42B2B' : '#333',
                        textDecoration: isItemRemoved ? 'line-through' : undefined,
                      }}
                    >
                      {item}
                      {j < cat.items.length - 1 ? ',' : ''}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div style={{ width: 2, background: '#000', flexShrink: 0 }} />

      {/* AFTER column */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#555', marginBottom: 12 }}>
          AFTER
        </div>
        {after.map((cat, i) => {
          const isNew = addedCategories.has(cat.category)
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#111',
                  marginBottom: 3,
                }}
              >
                {isNew && (
                  <span style={{ background: '#5CB85C', color: '#fff', fontSize: 9, padding: '1px 4px', marginRight: 6 }}>
                    + NEW
                  </span>
                )}
                {cat.category}
              </div>
              <div style={{ fontSize: 13, color: '#444' }}>
                {cat.items.map((item, j) => {
                  const isAdded = diff.added.some((a) => a.toLowerCase() === item.toLowerCase())
                  return (
                    <span
                      key={j}
                      style={{
                        display: 'inline-block',
                        marginRight: 6,
                        background: isAdded ? '#FFD600' : undefined,
                        padding: isAdded ? '0 3px' : undefined,
                      }}
                    >
                      {item}
                      {j < cat.items.length - 1 ? ',' : ''}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
