'use client'

interface FileCardProps {
  file: File
  onClear?: () => void
  onParse?: () => void
  badge?: 'success' | 'parsing' | null
  compact?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function truncate(name: string, max = 48): string {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

export default function FileCard({ file, onClear, onParse, badge, compact }: FileCardProps) {
  const ext = file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX'
  const size = formatBytes(file.size)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 20px',
          background: '#FAFAFA',
          border: '2px solid #0D0D0D',
          boxShadow: '3px 3px 0 #0D0D0D',
          width: compact ? 'auto' : 720,
          maxWidth: 720,
        }}
      >
        {/* File icon small */}
        <div
          style={{
            width: 32,
            height: 32,
            background: '#FFD600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid #0D0D0D',
          }}
        >
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
            <rect x="1" y="1" width="9" height="12" stroke="#0D0D0D" strokeWidth="1.5" />
            <path d="M10 1L13 4V17H5" stroke="#0D0D0D" strokeWidth="1.5" />
            <path d="M10 1V4H13" stroke="#0D0D0D" strokeWidth="1.5" />
          </svg>
        </div>

        {/* File name */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#0D0D0D',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {truncate(file.name)}
        </span>

        {/* Type + size pill */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: 0.8,
            padding: '3px 8px',
            background: '#F0F0F0',
            border: '1px solid #ccc',
            color: '#555',
            flexShrink: 0,
          }}
        >
          {ext} · {size}
        </span>

        {/* Badge */}
        {badge === 'success' && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#5CB85C',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✓
          </span>
        )}

        {/* Clear button */}
        {onClear && !badge && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              color: '#888',
              padding: '0 4px',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Parse CTA — only shown in State C */}
      {onParse && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="btn btn-y btn-lg"
            onClick={onParse}
          >
            Parse Resume →
          </button>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#888',
              letterSpacing: 0.5,
            }}
          >
            This runs locally with Ollama. Nothing leaves your machine.
          </p>
        </div>
      )}
    </div>
  )
}
