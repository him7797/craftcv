'use client'

import { useTailorStore } from '@/lib/store/useTailorStore'

const PLACEHOLDER =
  'Paste the job description here. Bullet points, requirements, nice-to-haves — all of it. The more text, the better the match analysis.'

export default function PasteJdTextarea({
  onSubmit,
}: {
  onSubmit?: () => void
}) {
  const draftJdText = useTailorStore((s) => s.draftJdText)
  const setDraftJdText = useTailorStore((s) => s.setDraftJdText)

  return (
    <textarea
      className="tailor-paste"
      placeholder={PLACEHOLDER}
      value={draftJdText}
      onChange={(e) => setDraftJdText(e.target.value)}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault()
          onSubmit?.()
        }
      }}
      spellCheck={false}
    />
  )
}
