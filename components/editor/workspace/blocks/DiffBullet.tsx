'use client'

type Tag = 'added' | 'removed' | 'reordered'

type Props = {
  text: string
  tag?: Tag
  side: 'before' | 'after'
}

const TAG_STYLES: Record<Tag, { bg: string; label: string }> = {
  added:     { bg: '#5CB85C', label: '+ ADDED' },
  removed:   { bg: '#C42B2B', label: '– REMOVED' },
  reordered: { bg: '#888',    label: '↕ REORDERED' },
}

export default function DiffBullet({ text, tag, side }: Props) {
  const tagConfig = tag ? TAG_STYLES[tag] : null

  return (
    <li
      style={{
        listStyle: 'disc',
        marginLeft: 20,
        marginBottom: 4,
        fontSize: 13,
        lineHeight: 1.5,
        color: side === 'before' && tag === 'removed' ? '#C42B2B' : '#111',
        textDecoration: side === 'before' && tag === 'removed' ? 'line-through' : undefined,
      }}
    >
      {tagConfig && (
        <span
          style={{
            display: 'inline-block',
            background: tagConfig.bg,
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.5px',
            padding: '1px 5px',
            marginRight: 6,
            verticalAlign: 'middle',
          }}
        >
          {tagConfig.label}
        </span>
      )}
      <span
        style={{
          borderBottom: side === 'after' && tag === 'reordered' ? '2px solid #FFD600' : undefined,
        }}
      >
        {text}
      </span>
    </li>
  )
}
