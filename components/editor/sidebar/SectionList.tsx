'use client'

import { useStore } from '@/lib/store'
import type { EditorSection } from '@/lib/types'

const SECTIONS: { id: EditorSection; label: string }[] = [
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'skills', label: 'SKILLS & TECH' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'header', label: 'HEADER' },
]

export default function SectionList() {
  const active = useStore((s) => s.editor.activeSection)
  const setActiveSection = useStore((s) => s.setActiveSection)

  return (
    <div>
      <div className="editor-side-h">SECTIONS</div>
      <div className="editor-side-list">
        {SECTIONS.map((section) => {
          const isActive = active === section.id
          return (
            <button
              key={section.id}
              type="button"
              className={'editor-side-item' + (isActive ? ' active' : '')}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.label}</span>
              {isActive && <span className="editor-side-add" aria-label="add entry">+</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
