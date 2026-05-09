'use client'

import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  onEdit?: () => void
  onAddBullet?: () => void
  rightSlot?: ReactNode
}

export default function SectionHeader({ title, subtitle, onEdit, onAddBullet, rightSlot }: Props) {
  return (
    <div className="editor-section-head">
      <div>
        <div className="editor-section-title">{title}</div>
        {subtitle && <div className="editor-section-sub">{subtitle}</div>}
      </div>
      <div className="editor-section-actions">
        {rightSlot}
        {onEdit && (
          <button type="button" className="editor-btn-sm" onClick={onEdit}>
            EDIT
          </button>
        )}
        {onAddBullet && (
          <button type="button" className="editor-btn-sm y" onClick={onAddBullet}>
            + BULLET
          </button>
        )}
      </div>
    </div>
  )
}
