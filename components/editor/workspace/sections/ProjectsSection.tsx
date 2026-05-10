'use client'

import { useStore } from '@/lib/store'
import type { Resume } from '@/lib/types'

const TXT: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 13.5,
  color: '#222',
  background: 'none',
  border: '1px solid transparent',
  outline: 'none',
  padding: '4px 6px',
  width: '100%',
}

export default function ProjectsSection({ resume }: { resume: Resume }) {
  const addProject = useStore((s) => s.addProject)
  const removeProject = useStore((s) => s.removeProject)
  const updateProjectField = useStore((s) => s.updateProjectField)
  const updateProjectTech = useStore((s) => s.updateProjectTech)

  const projects = resume.projects ?? []

  return (
    <div>
      <div className="editor-section-head">
        <div>
          <div className="editor-section-title">Projects</div>
          <div className="editor-section-sub">{projects.length} projects</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
        {projects.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 14,
              border: '1px solid var(--lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <input
                type="text"
                defaultValue={p.name}
                onBlur={(e) => updateProjectField(i, 'name', e.target.value.trim())}
                style={{
                  ...TXT,
                  fontWeight: 600,
                  fontSize: 16,
                  flex: 1,
                }}
                placeholder="Project name"
              />
              <button
                type="button"
                className="editor-bullet-btn"
                onClick={() => removeProject(i)}
                title="Remove project"
              >
                ✕
              </button>
            </div>
            <textarea
              defaultValue={p.description}
              onBlur={(e) => updateProjectField(i, 'description', e.target.value)}
              rows={2}
              style={{ ...TXT, lineHeight: 1.5, resize: 'vertical', minHeight: 40 }}
              placeholder="Description"
            />
            <input
              type="text"
              defaultValue={p.tech?.join(', ') ?? ''}
              onBlur={(e) => {
                const tech = e.target.value
                  .split(',')
                  .map((x) => x.trim())
                  .filter(Boolean)
                updateProjectTech(i, tech)
              }}
              style={{
                ...TXT,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#444',
              }}
              placeholder="Tech (comma-separated)"
            />
            <input
              type="text"
              defaultValue={p.link ?? ''}
              onBlur={(e) => updateProjectField(i, 'link', e.target.value.trim())}
              style={{ ...TXT, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444' }}
              placeholder="Link (https://…)"
            />
          </div>
        ))}

        <button
          type="button"
          className="editor-btn-sm y"
          onClick={addProject}
          style={{ alignSelf: 'flex-start' }}
        >
          + PROJECT
        </button>
      </div>
    </div>
  )
}
