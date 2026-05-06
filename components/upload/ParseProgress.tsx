'use client'

import type { ParseStage } from '@/lib/types'
import FileCard from './FileCard'

interface ParseProgressProps {
  file: File
  stage: ParseStage
  statusMessage: string
}

const STAGES: { id: ParseStage; label: string }[] = [
  { id: 'file-loaded', label: 'FILE LOADED' },
  { id: 'extracting-text', label: 'EXTRACTING TEXT' },
  { id: 'parsing-sections', label: 'PARSING SECTIONS' },
  { id: 'applying-guidelines', label: 'APPLYING GUIDELINES' },
]

const STAGE_ORDER: ParseStage[] = [
  'file-loaded',
  'extracting-text',
  'parsing-sections',
  'applying-guidelines',
]

function stageStatus(stageId: ParseStage, active: ParseStage): 'done' | 'active' | 'pending' {
  const activeIdx = STAGE_ORDER.indexOf(active)
  const thisIdx = STAGE_ORDER.indexOf(stageId)
  if (thisIdx < activeIdx) return 'done'
  if (thisIdx === activeIdx) return 'active'
  return 'pending'
}

export default function ParseProgress({ file, stage, statusMessage }: ParseProgressProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%' }}>
      <FileCard file={file} badge="parsing" />

      <div
        style={{
          width: 720,
          border: '2px solid #0D0D0D',
          boxShadow: '3px 3px 0 #0D0D0D',
          background: '#FAFAFA',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Stage rows */}
        {STAGES.map(({ id, label }) => {
          const status = stageStatus(id, stage)
          return (
            <div
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: status === 'done' ? '#5CB85C' : status === 'active' ? '#0D0D0D' : '#666',
              }}
            >
              {/* Glyph */}
              <span style={{ width: 24, display: 'inline-block', textAlign: 'center' }}>
                {status === 'done' && '✓'}
                {status === 'active' && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#FFD600',
                      animation: 'pulse 0.8s ease-in-out infinite',
                    }}
                  />
                )}
                {status === 'pending' && ' '}
              </span>
              <span style={{ fontWeight: status === 'active' ? 700 : 400 }}>{label}</span>
            </div>
          )
        })}

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            background: '#E8E8E8',
            marginTop: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: '#FFD600',
              width: '40%',
              animation: 'indeterminate 1.4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Estimate */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#888',
            letterSpacing: 0.5,
          }}
        >
          ~10 seconds
        </p>

        {/* Status line */}
        <div
          role="status"
          aria-live="polite"
          style={{
            background: '#FFFAE0',
            padding: '8px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#0D0D0D',
            letterSpacing: 0.3,
          }}
        >
          {statusMessage}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  )
}
