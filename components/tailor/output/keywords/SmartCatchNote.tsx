import type { SmartCatch } from '@/lib/types'

export default function SmartCatchNote({ catches }: { catches: SmartCatch[] }) {
  if (catches.length === 0) return null
  return (
    <>
      {catches.map((c, i) => (
        <div key={`${c.keyword}-${i}`} className="tailor-note-callout">
          <span className="label">NOTE:</span>
          You have <b>{c.keyword}</b> experience in <b>{c.foundIn}</b> — {c.suggestion}
        </div>
      ))}
    </>
  )
}
