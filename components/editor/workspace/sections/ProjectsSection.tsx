'use client'

import { Fragment } from 'react'
import AiSuggestionCard from '../AiSuggestionCard'
import BulletRow from '../BulletRow'
import NewBulletInput from '../NewBulletInput'
import RewriteBlockButton from '../blocks/RewriteBlockButton'
import { dispatchRewrite } from '@/lib/editor/aiDispatch'
import { dispatchBlockRewrite } from '@/lib/editor/blockRewriteDispatch'
import { isParentMatch, isPathMatch } from '@/lib/editor/aiMatch'
import { useStore } from '@/lib/store'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
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
  const session = useStore((s) => s.editor.aiSession)
  const blockSession = useBlockRewriteStore((s) => s.session)

  const projects = resume.projects ?? []

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
        <div>
          <div className="editor-section-title">Projects</div>
          <div className="editor-section-sub">{projects.length} projects</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
        {projects.map((p, projectIndex) => {
          const parent = { section: 'projects' as const, projectIndex }
          const isEmpty = !p.description && (!p.bullets || p.bullets.length === 0)
          return (
            <div
              key={projectIndex}
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
                  onBlur={(e) => updateProjectField(projectIndex, 'name', e.target.value.trim())}
                  style={{ ...TXT, fontWeight: 600, fontSize: 16, flex: 1 }}
                  placeholder="Project name"
                />
                <RewriteBlockButton
                  id={`rewrite-btn-project-block-${projectIndex}`}
                  label="REWRITE"
                  disabled={isEmpty || !!blockSession}
                  onClick={() =>
                    guardedRewrite(() =>
                      dispatchBlockRewrite(
                        { blockType: 'project-block', projectIndex },
                        {
                          blockType: 'project-block',
                          name: p.name,
                          description: p.description,
                          tech: p.tech ?? [],
                          bullets: p.bullets ?? [],
                          link: p.link,
                        },
                      )
                    )
                  }
                />
                <button
                  type="button"
                  className="editor-bullet-btn"
                  onClick={() => removeProject(projectIndex)}
                  title="Remove project"
                >
                  ✕
                </button>
              </div>
              <textarea
                defaultValue={p.description}
                onBlur={(e) => updateProjectField(projectIndex, 'description', e.target.value)}
                rows={2}
                style={{ ...TXT, lineHeight: 1.5, resize: 'vertical', minHeight: 40 }}
                placeholder="Description"
              />
              <input
                type="text"
                defaultValue={p.tech?.join(', ') ?? ''}
                onBlur={(e) => {
                  const tech = e.target.value.split(',').map((x) => x.trim()).filter(Boolean)
                  updateProjectTech(projectIndex, tech)
                }}
                style={{ ...TXT, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444' }}
                placeholder="Tech (comma-separated)"
              />
              <input
                type="text"
                defaultValue={p.link ?? ''}
                onBlur={(e) => updateProjectField(projectIndex, 'link', e.target.value.trim())}
                style={{ ...TXT, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#444' }}
                placeholder="Link (https://…)"
              />

              {/* Project bullets */}
              {(p.bullets ?? []).map((text, bulletIndex) => {
                const path = { section: 'projects' as const, projectIndex, bulletIndex }
                const matched = isPathMatch(session?.target, path)
                return (
                  <Fragment key={bulletIndex}>
                    <BulletRow
                      path={path}
                      text={text}
                      muted={matched}
                      onRequestAi={() => dispatchRewrite(path, text)}
                    />
                    {matched && <AiSuggestionCard />}
                  </Fragment>
                )
              })}
              {isParentMatch(session?.target, parent) && <AiSuggestionCard />}
              <NewBulletInput
                parent={parent}
                onRequestAi={(rough) => dispatchRewrite({ section: 'new-bullet', parent }, rough)}
              />
            </div>
          )
        })}

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
