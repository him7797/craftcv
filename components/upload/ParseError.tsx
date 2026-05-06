'use client'

import type { ParseResult } from '@/lib/types'
import FileCard from './FileCard'

interface ParseErrorProps {
  file: File
  result: Extract<ParseResult, { status: 'error' | 'partial' }>
  onRetry: () => void
  onStartBlank: () => void
  onContinue?: () => void
}

export default function ParseError({
  file,
  result,
  onRetry,
  onStartBlank,
  onContinue,
}: ParseErrorProps) {
  const isPartial = result.status === 'partial'

  const heading = isPartial ? 'PARTIAL PARSE' : "COULDN'T READ THIS FILE"

  const body = isPartial
    ? (() => {
        const partial = result as Extract<ParseResult, { status: 'partial' }>
        const extracted = ['header', 'experience', 'skills', 'education']
          .filter((f) => !partial.missingFields.includes(f))
          .map((f) => f.toUpperCase())
        const missing = partial.missingFields.map((f) => f.toUpperCase())
        return `Extracted ${extracted.join(' + ') || 'nothing'}. Couldn't confidently identify ${missing.join(' or ')} sections.`
      })()
    : (result as Extract<ParseResult, { status: 'error' }>).message

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%' }}>
      <FileCard file={file} />

      <div
        style={{
          width: 720,
          border: '2px solid #0D0D0D',
          boxShadow: '3px 3px 0 #0D0D0D',
          background: '#FAFAFA',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#C42B2B',
          }}
        >
          {heading}
        </p>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#444',
            lineHeight: 1.6,
            letterSpacing: 0.3,
          }}
        >
          {body}
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {isPartial && onContinue ? (
            <>
              <button type="button" className="btn btn-y" onClick={onContinue}>
                Continue to Editor →
              </button>
              <button type="button" className="btn btn-w" onClick={onRetry}>
                Re-Upload
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-y" onClick={onRetry}>
                Try Another File
              </button>
              <button type="button" className="btn btn-w" onClick={onStartBlank}>
                Start Blank
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
