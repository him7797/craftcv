'use client'

import RewriteBlockButton from '../blocks/RewriteBlockButton'
import { dispatchBlockRewrite } from '@/lib/editor/blockRewriteDispatch'
import { useStore } from '@/lib/store'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
import type { Resume } from '@/lib/types'

export default function SkillsSection({ resume }: { resume: Resume }) {
  const addSkillCategory = useStore((s) => s.addSkillCategory)
  const removeSkillCategory = useStore((s) => s.removeSkillCategory)
  const updateSkillCategory = useStore((s) => s.updateSkillCategory)
  const updateSkillItems = useStore((s) => s.updateSkillItems)
  const blockSession = useBlockRewriteStore((s) => s.session)

  function guardedRewrite(fn: () => void) {
    if (blockSession) {
      if (window.confirm('Discard current rewrite?')) {
        useBlockRewriteStore.getState().cancelRewrite()
        fn()
      }
    } else {
      fn()
    }
  }

  return (
    <div>
      <div className="editor-section-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <div className="editor-section-title">Skills & Tech</div>
            <div className="editor-section-sub">{resume.skills.length} categories</div>
          </div>
          <RewriteBlockButton
            id="rewrite-btn-skills-section"
            label="REORGANIZE"
            disabled={resume.skills.length === 0 || !!blockSession}
            onClick={() =>
              guardedRewrite(() =>
                dispatchBlockRewrite(
                  { blockType: 'skills-section' },
                  { blockType: 'skills-section', categories: resume.skills },
                )
              )
            }
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24 }}>
        {resume.skills.map((cat, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr auto',
              gap: 14,
              alignItems: 'flex-start',
              borderBottom: '1px solid var(--lg)',
              paddingBottom: 14,
            }}
          >
            <input
              type="text"
              defaultValue={cat.category}
              onBlur={(e) => {
                const v = e.target.value.trim()
                if (v && v !== cat.category) updateSkillCategory(i, v)
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                color: 'var(--b)',
                background: 'none',
                border: 'none',
                outline: 'none',
                textTransform: 'uppercase',
                padding: '4px 0',
              }}
            />
            <textarea
              defaultValue={cat.items.join(', ')}
              onBlur={(e) => {
                const items = e.target.value.split(',').map((x) => x.trim()).filter(Boolean)
                updateSkillItems(i, items)
              }}
              rows={2}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 13.5,
                lineHeight: 1.5,
                color: '#222',
                background: 'none',
                border: '1px solid transparent',
                outline: 'none',
                padding: '4px 6px',
                resize: 'vertical',
                minHeight: 32,
              }}
            />
            <button
              type="button"
              className="editor-bullet-btn"
              onClick={() => removeSkillCategory(i)}
              title="Remove category"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className="editor-btn-sm y"
          onClick={addSkillCategory}
          style={{ alignSelf: 'flex-start', marginTop: 8 }}
        >
          + CATEGORY
        </button>
      </div>
    </div>
  )
}
