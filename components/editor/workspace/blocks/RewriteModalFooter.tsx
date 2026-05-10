'use client'

import type { RetryHint } from '@/lib/types'

type Props = {
  streaming: boolean
  provider: string
  model: string
  jdActive: boolean
  jdName: string
  jdTooShort: boolean
  retriesLeft: number
  onAccept: () => void
  onEditInPlace: () => void
  onReject: () => void
  onRetry: (hint: RetryHint) => void
  hasError: boolean
  hasSuggestion: boolean
}

export default function RewriteModalFooter({
  streaming,
  provider,
  model,
  jdActive,
  jdName,
  jdTooShort,
  retriesLeft,
  onAccept,
  onEditInPlace,
  onReject,
  onRetry,
  hasError,
  hasSuggestion,
}: Props) {
  const retryDisabled = retriesLeft <= 0 || streaming
  const actionDisabled = streaming || !hasSuggestion || hasError

  let statusText: React.ReactNode
  if (streaming) {
    statusText = (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#FFD600',
            animation: 'pulse-dot 1s ease-in-out infinite',
          }}
        />
        ▸ {model} is rewriting...
      </span>
    )
  } else if (jdTooShort) {
    statusText = `WITHOUT JD CONTEXT — JD too short · ${model}`
  } else if (jdActive) {
    statusText = `WITH JD CONTEXT — ${jdName.toUpperCase()} · ${model}`
  } else {
    statusText = `REWRITTEN BY ${model.toUpperCase()} · ${provider.toUpperCase()}`
  }

  return (
    <div
      style={{
        height: 64,
        background: '#F0F0F0',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: '#555',
        }}
      >
        {statusText}
      </span>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => !retryDisabled && onRetry('different-angle')}
          disabled={retryDisabled}
          title={retriesLeft <= 0 ? 'Retry limit reached — try Edit in Place.' : 'Retry with a different angle'}
          style={outlineButtonStyle(retryDisabled)}
        >
          RETRY ↻
        </button>

        <button
          type="button"
          onClick={() => !actionDisabled && onEditInPlace()}
          disabled={actionDisabled}
          style={outlineButtonStyle(actionDisabled)}
        >
          EDIT IN PLACE
        </button>

        <button
          type="button"
          onClick={onReject}
          style={outlineButtonStyle(false)}
        >
          REJECT
        </button>

        <button
          type="button"
          onClick={() => !actionDisabled && onAccept()}
          disabled={actionDisabled}
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            padding: '8px 18px',
            background: actionDisabled ? '#e0e0e0' : '#FFD600',
            border: actionDisabled ? '2px solid #aaa' : '2px solid #000',
            boxShadow: actionDisabled ? 'none' : '2px 2px 0 #000',
            cursor: actionDisabled ? 'not-allowed' : 'pointer',
            color: '#000',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={(e) => {
            if (!actionDisabled) {
              e.currentTarget.style.transform = 'translate(-2px,-2px)'
              e.currentTarget.style.boxShadow = '4px 4px 0 #000'
            }
          }}
          onMouseLeave={(e) => {
            if (!actionDisabled) {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '2px 2px 0 #000'
            }
          }}
        >
          ACCEPT REPLACEMENT
        </button>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function outlineButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    padding: '7px 12px',
    background: '#fff',
    border: disabled ? '2px solid #ccc' : '2px solid #000',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? '#aaa' : '#000',
    boxShadow: 'none',
  }
}
