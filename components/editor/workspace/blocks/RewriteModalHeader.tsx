'use client'

import type { BlockType } from '@/lib/types'

type Props = {
  blockType: BlockType
  blockLabel: string
  onClose: () => void
}

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  'experience-description': 'REWRITE: EXPERIENCE DESCRIPTION',
  'project-block': 'REWRITE: PROJECT BLOCK',
  'experience-bullets': 'REWRITE: ALL BULLETS',
  'skills-section': 'REORGANIZE: LANGUAGES & TECHNOLOGIES',
}

export default function RewriteModalHeader({ blockType, blockLabel, onClose }: Props) {
  const baseLabel = BLOCK_TYPE_LABELS[blockType]
  const displayLabel = blockLabel ? `${baseLabel} — ${blockLabel.toUpperCase()}` : baseLabel

  return (
    <div
      style={{
        height: 56,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#FFD600',
        }}
      >
        {displayLabel}
      </span>
      <button
        type="button"
        onClick={onClose}
        style={{
          fontFamily: 'monospace',
          fontSize: 14,
          color: '#fff',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          lineHeight: 1,
        }}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}
