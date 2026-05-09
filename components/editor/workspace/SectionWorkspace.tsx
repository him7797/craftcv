'use client'

import EducationSection from './sections/EducationSection'
import ExperienceSection from './sections/ExperienceSection'
import HeaderSection from './sections/HeaderSection'
import ProjectsSection from './sections/ProjectsSection'
import SkillsSection from './sections/SkillsSection'
import { useStore } from '@/lib/store'

export default function SectionWorkspace() {
  const section = useStore((s) => s.editor.activeSection)
  const version = useStore((s) => s.versions[s.editor.activeVersionId])

  if (!version) {
    return (
      <main className="editor-workspace">
        <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          No active version.
        </div>
      </main>
    )
  }

  return (
    <main className="editor-workspace">
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: '#888',
          letterSpacing: 1.2,
          marginBottom: 12,
          textTransform: 'uppercase',
        }}
      >
        {section} · {version.name}
      </div>

      {section === 'experience' && <ExperienceSection resume={version.resume} />}
      {section === 'skills' && <SkillsSection resume={version.resume} />}
      {section === 'education' && <EducationSection resume={version.resume} />}
      {section === 'projects' && <ProjectsSection resume={version.resume} />}
      {section === 'header' && <HeaderSection resume={version.resume} />}
    </main>
  )
}
