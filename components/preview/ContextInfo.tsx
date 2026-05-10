'use client'

import { useStore } from '@/lib/store'
import { usePreviewStore } from '@/lib/store/usePreviewStore'

function fitStatusLabel(
  measurement: ReturnType<typeof usePreviewStore.getState>['measurement'],
): string {
  if (!measurement) return '—'
  if (measurement.fitStatus === 'good') return 'PDF READY'
  if (measurement.fitStatus === 'underfilled') return 'UNDER 1 PAGE — EXPAND'
  return `OVER ${measurement.pageCount - 1} PAGES — TRIM`
}

export default function ContextInfo() {
  const activeVersionId = useStore((s) => s.editor.activeVersionId)
  const versions = useStore((s) => s.versions)
  const measurement = usePreviewStore((s) => s.measurement)

  const versionName = versions[activeVersionId]?.name ?? 'RESUME'
  const pageLabel = measurement
    ? `${measurement.pageCount} PAGE${measurement.pageCount === 1 ? '' : 'S'}`
    : '— PAGES'
  const fitLabel = fitStatusLabel(measurement)

  return (
    <div className="preview-substrip-left">
      PREVIEW — {versionName.toUpperCase()}{' '}
      <span style={{ color: '#999' }}>·</span> {pageLabel}{' '}
      <span style={{ color: '#999' }}>·</span> {fitLabel}
    </div>
  )
}
