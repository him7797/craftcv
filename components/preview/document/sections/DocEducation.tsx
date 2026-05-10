import type { Resume } from '@/lib/types'
import SectionHeading from '../SectionHeading'

export default function DocEducation({ education }: { education: Resume['education'] }) {
  if (!education || education.length === 0) return null
  return (
    <section>
      <SectionHeading label="EDUCATION" />
      <div className="doc-edu-list">
        {education.map((e, i) => (
          <div key={`${e.institution}-${i}`} className="doc-edu-row">
            <div>
              <span className="doc-edu-degree">{e.degree}</span>
              <span className="doc-edu-inst">{e.institution}</span>
            </div>
            <div className="doc-edu-years">
              {e.startYear} – {e.endYear}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
