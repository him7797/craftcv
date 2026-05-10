'use client'

type Props = {
  label: 'REWRITE' | 'REWRITE ALL BULLETS' | 'REORGANIZE'
  disabled?: boolean
  onClick: () => void
  id?: string
}

export default function RewriteBlockButton({ label, disabled, onClick, id }: Props) {
  return (
    <button
      id={id}
      type="button"
      onClick={disabled ? undefined : onClick}
      title={disabled ? 'Add some content first, then AI can improve it.' : `${label} with AI`}
      style={{
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        padding: '7px 14px',
        background: disabled ? '#e0e0e0' : '#FFD600',
        border: disabled ? '2px solid #aaa' : '2px solid #000',
        boxShadow: disabled ? 'none' : '2px 2px 0 #000',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'transform 0.1s, box-shadow 0.1s',
        color: '#000',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          const btn = e.currentTarget
          btn.style.transform = 'translate(-2px, -2px)'
          btn.style.boxShadow = '4px 4px 0 #000'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          const btn = e.currentTarget
          btn.style.transform = ''
          btn.style.boxShadow = '2px 2px 0 #000'
        }
      }}
    >
      {label}
      <span style={{ fontSize: 12 }}>✦</span>
    </button>
  )
}
