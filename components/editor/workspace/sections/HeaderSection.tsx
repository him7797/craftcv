'use client'

import { useStore } from '@/lib/store'
import type { Resume } from '@/lib/types'

const FIELD: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: '#222',
  background: 'none',
  border: '1px solid var(--lg)',
  outline: 'none',
  padding: '8px 10px',
  width: '100%',
}

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  color: '#888',
  letterSpacing: 1.2,
  fontWeight: 700,
  marginBottom: 4,
  textTransform: 'uppercase',
}

export default function HeaderSection({ resume }: { resume: Resume }) {
  const updateHeaderField = useStore((s) => s.updateHeaderField)
  const addHeaderLink = useStore((s) => s.addHeaderLink)
  const removeHeaderLink = useStore((s) => s.removeHeaderLink)
  const updateHeaderLink = useStore((s) => s.updateHeaderLink)

  return (
    <div>
      <div className="editor-section-head">
        <div>
          <div className="editor-section-title">Header</div>
          <div className="editor-section-sub">Name, location, contact, links</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18, marginTop: 24, maxWidth: 560 }}>
        <div>
          <div style={LABEL}>NAME</div>
          <input
            type="text"
            defaultValue={resume.header.name}
            onBlur={(e) => updateHeaderField('name', e.target.value.trim())}
            style={{ ...FIELD, fontWeight: 600, fontSize: 18 }}
          />
        </div>
        <div>
          <div style={LABEL}>LOCATION</div>
          <input
            type="text"
            defaultValue={resume.header.location ?? ''}
            onBlur={(e) => updateHeaderField('location', e.target.value.trim())}
            style={FIELD}
          />
        </div>
        <div>
          <div style={LABEL}>EMAIL</div>
          <input
            type="email"
            defaultValue={resume.header.email ?? ''}
            onBlur={(e) => updateHeaderField('email', e.target.value.trim())}
            style={FIELD}
          />
        </div>
        <div>
          <div style={LABEL}>LINKS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(resume.header.links ?? []).map((link, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto',
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  defaultValue={link.label}
                  onBlur={(e) =>
                    updateHeaderLink(i, { label: e.target.value.trim(), url: link.url })
                  }
                  style={FIELD}
                  placeholder="Label"
                />
                <input
                  type="url"
                  defaultValue={link.url}
                  onBlur={(e) =>
                    updateHeaderLink(i, { label: link.label, url: e.target.value.trim() })
                  }
                  style={FIELD}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  className="editor-bullet-btn"
                  onClick={() => removeHeaderLink(i)}
                  title="Remove link"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="editor-btn-sm"
              onClick={addHeaderLink}
              style={{ alignSelf: 'flex-start' }}
            >
              + LINK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
