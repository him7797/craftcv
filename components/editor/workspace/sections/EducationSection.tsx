'use client'

import { useStore } from '@/lib/store'
import type { Resume } from '@/lib/types'

const FIELD_INPUT: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 13.5,
  color: '#222',
  background: 'none',
  border: '1px solid transparent',
  outline: 'none',
  padding: '4px 6px',
}

const FIELD_INSTITUTION: React.CSSProperties = {
  ...FIELD_INPUT,
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  fontSize: 16,
}

export default function EducationSection({ resume }: { resume: Resume }) {
  const addEducation = useStore((s) => s.addEducation)
  const removeEducation = useStore((s) => s.removeEducation)
  const updateEducationField = useStore((s) => s.updateEducationField)

  return (
    <div>
      <div className="editor-section-head">
        <div>
          <div className="editor-section-title">Education</div>
          <div className="editor-section-sub">{resume.education.length} entries</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {resume.education.map((edu, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 12,
              padding: 12,
              border: '1px solid var(--lg)',
            }}
          >
            <input
              type="text"
              defaultValue={edu.institution}
              onBlur={(e) =>
                updateEducationField(i, 'institution', e.target.value.trim())
              }
              style={FIELD_INSTITUTION}
              placeholder="Institution"
            />
            <input
              type="text"
              defaultValue={edu.degree}
              onBlur={(e) => updateEducationField(i, 'degree', e.target.value.trim())}
              style={FIELD_INPUT}
              placeholder="Degree"
            />
            <button
              type="button"
              className="editor-bullet-btn"
              onClick={() => removeEducation(i)}
              title="Remove"
            >
              ✕
            </button>
            <input
              type="text"
              defaultValue={edu.startYear}
              onBlur={(e) => updateEducationField(i, 'startYear', e.target.value.trim())}
              style={FIELD_INPUT}
              placeholder="Start year"
            />
            <input
              type="text"
              defaultValue={edu.endYear}
              onBlur={(e) => updateEducationField(i, 'endYear', e.target.value.trim())}
              style={FIELD_INPUT}
              placeholder="End year"
            />
            <span />
          </div>
        ))}

        <button
          type="button"
          className="editor-btn-sm y"
          onClick={addEducation}
          style={{ alignSelf: 'flex-start' }}
        >
          + EDUCATION
        </button>
      </div>
    </div>
  )
}
