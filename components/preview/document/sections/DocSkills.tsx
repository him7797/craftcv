import type { Resume } from '@/lib/types'
import SectionHeading from '../SectionHeading'
import DocSkillCategory from './DocSkillCategory'

export default function DocSkills({ skills }: { skills: Resume['skills'] }) {
  if (!skills || skills.length === 0) return null
  return (
    <section>
      <SectionHeading label="LANGUAGES & TECHNOLOGIES" />
      <div className="doc-skills-grid">
        {skills.map((cat, i) => (
          <DocSkillCategory key={`${cat.category}-${i}`} category={cat.category} items={cat.items} />
        ))}
      </div>
    </section>
  )
}
