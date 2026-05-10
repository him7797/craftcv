import type { Resume } from '@/lib/types'
import DocBulletList from './DocBulletList'

type Client = NonNullable<Resume['experience'][number]['clients']>[number]

export default function DocClientGroup({ client }: { client: Client }) {
  const dateRange = `${client.startDate} – ${client.endDate}`
  const techText = client.tech && client.tech.length > 0 ? client.tech.join(', ') : null

  return (
    <div className="doc-client-group">
      <div className="doc-client-line">
        <span className="doc-client-label">Client:</span>
        <span className="doc-client-name">{client.name}</span>
        {techText && (
          <>
            <span className="doc-meta-sep">·</span>
            <span className="doc-meta-line">{techText}</span>
          </>
        )}
        <span className="doc-meta-sep">·</span>
        <span className="doc-meta-line">{dateRange}</span>
      </div>
      <DocBulletList bullets={client.bullets} />
    </div>
  )
}
