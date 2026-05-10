import type { Resume } from '@/lib/types'
import DocClientGroup from './DocClientGroup'
import DocBulletList from './DocBulletList'

type Experience = Resume['experience'][number]

export default function DocExperienceBlock({ experience }: { experience: Experience }) {
  const dateRange = `${experience.startDate} – ${experience.endDate}`
  const hasClients = !!experience.clients && experience.clients.length > 0

  return (
    <section className="doc-experience-block">
      <div className="doc-job-header">
        <div>
          <span className="doc-job-title">{experience.role}</span>
          <span className="doc-job-sep">·</span>
          <span className="doc-job-company">{experience.company}</span>
        </div>
        <div className="doc-date">{dateRange}</div>
      </div>

      {hasClients ? (
        experience.clients!.map((c, i) => <DocClientGroup key={`${c.name}-${i}`} client={c} />)
      ) : (
        <DocBulletList bullets={experience.bullets ?? []} />
      )}
    </section>
  )
}
