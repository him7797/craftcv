'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { usePreviewStore } from '@/lib/store/usePreviewStore'
import { deriveAtsFlags } from '@/lib/preview/atsFlags'

export default function StatusBar() {
  const router = useRouter()
  const activeVersionId = useStore((s) => s.editor.activeVersionId)
  const versions = useStore((s) => s.versions)
  const measurement = usePreviewStore((s) => s.measurement)

  const activeVersion = versions[activeVersionId]
  const flags = activeVersion ? deriveAtsFlags(activeVersion.resume) : { singleColumn: true, noPhotos: true }

  const pageLabel = measurement ? `${measurement.pageCount} PAGE${measurement.pageCount === 1 ? '' : 'S'}` : '— PAGES'

  function jumpToScore() {
    router.push('/score')
  }

  return (
    <footer className="editor-statusbar preview-statusbar">
      <div>
        CRAFTCV <span style={{ color: '#444' }}>·</span> PREVIEW MODE{' '}
        <span style={{ color: '#444' }}>·</span> PRINT CMD+P{' '}
        <span style={{ color: '#444' }}>·</span> SAVE AS PDF
      </div>
      <div>
        {pageLabel} <span style={{ color: '#444' }}>·</span> SINGLE COLUMN{' '}
        {flags.singleColumn ? (
          <span className="ok">✓</span>
        ) : (
          <span className="warn" role="button" onClick={jumpToScore}>!</span>
        )}{' '}
        <span style={{ color: '#444' }}>·</span> NO PHOTOS{' '}
        {flags.noPhotos ? (
          <span className="ok">✓</span>
        ) : (
          <span className="warn" role="button" onClick={jumpToScore}>!</span>
        )}
      </div>
    </footer>
  )
}
