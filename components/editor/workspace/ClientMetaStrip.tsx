'use client'

type Props = {
  label?: string
  name: string
  tech?: string[]
  startDate?: string
  endDate?: string
}

export default function ClientMetaStrip({ label = 'CLIENT', name, tech, startDate, endDate }: Props) {
  const dateRange = formatRange(startDate, endDate)
  const techStr = tech && tech.length > 0 ? tech.join(' · ') : null

  return (
    <div className="editor-meta-strip">
      <span className="label">{label}:</span>
      <span className="name">{name}</span>
      {techStr && (
        <>
          <span className="sep">·</span>
          <span>{techStr}</span>
        </>
      )}
      {dateRange && (
        <>
          <span className="sep">·</span>
          <span>{dateRange}</span>
        </>
      )}
    </div>
  )
}

function formatRange(start?: string, end?: string): string | null {
  if (!start && !end) return null
  if (start && end) return `${start} – ${end}`
  return start ?? end ?? null
}
