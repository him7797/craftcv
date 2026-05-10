import type { Resume } from '@/lib/types'
import SectionHeading from '../SectionHeading'
import DocExperienceBlock from './DocExperienceBlock'

export default function DocExperience({ experience }: { experience: Resume['experience'] }) {
  if (!experience || experience.length === 0) return null
  return (
    <section>
      <SectionHeading label="EXPERIENCE" />
      {experience.map((exp, i) => (
        <DocExperienceBlock key={`${exp.company}-${i}`} experience={exp} />
      ))}
    </section>
  )
}
