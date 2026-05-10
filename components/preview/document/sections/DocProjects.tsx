import type { Resume } from '@/lib/types'
import SectionHeading from '../SectionHeading'

export default function DocProjects({ projects }: { projects: Resume['projects'] }) {
  if (!projects || projects.length === 0) return null
  return (
    <section>
      <SectionHeading label="PROJECTS" />
      {projects.map((p, i) => (
        <div key={`${p.name}-${i}`} className="doc-project">
          <div className="doc-project-head">
            <span className="doc-project-name">{p.name}</span>
            {p.link && (
              <a className="doc-project-link" href={p.link} target="_blank" rel="noopener noreferrer">
                {p.link}
              </a>
            )}
          </div>
          {p.tech && p.tech.length > 0 && (
            <div className="doc-project-tech">{p.tech.join(', ')}</div>
          )}
          {p.description && (
            <div className="doc-project-bullets">
              <ul className="doc-bullet-list">
                <li className="doc-bullet">{p.description}</li>
              </ul>
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
