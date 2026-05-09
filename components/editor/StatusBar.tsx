'use client'

import { useStore } from '@/lib/store'

export default function StatusBar() {
  const versionName = useStore((s) => {
    const v = s.versions[s.editor.activeVersionId]
    return v?.name ?? '—'
  })

  return (
    <footer className="editor-statusbar">
      <div>
        CRAFTCV <span style={{ color: '#444' }}>·</span> PERSONAL BUILD{' '}
        <span style={{ color: '#444' }}>·</span> MAC M2{' '}
        <span style={{ color: '#444' }}>·</span> OLLAMA LOCAL
      </div>
      <div>
        1 PAGE <span style={{ color: '#444' }}>·</span> PDF READY{' '}
        <span style={{ color: '#444' }}>·</span> <b>{versionName.toUpperCase()}</b>
      </div>
    </footer>
  )
}
