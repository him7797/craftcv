'use client'

import { Fragment } from 'react'
import AiSuggestionCard from '../AiSuggestionCard'
import BulletRow from '../BulletRow'
import ClientMetaStrip from '../ClientMetaStrip'
import NewBulletInput from '../NewBulletInput'
import SectionHeader from '../SectionHeader'
import RewriteBlockButton from '../blocks/RewriteBlockButton'
import { dispatchRewrite } from '@/lib/editor/aiDispatch'
import { dispatchBlockRewrite } from '@/lib/editor/blockRewriteDispatch'
import { isParentMatch, isPathMatch } from '@/lib/editor/aiMatch'
import { useStore } from '@/lib/store'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
import type { Resume } from '@/lib/types'

export default function ExperienceSection({ resume }: { resume: Resume }) {
  const addExperience = useStore((s) => s.addExperience)
  const removeExperience = useStore((s) => s.removeExperience)
  const updateExperienceField = useStore((s) => s.updateExperienceField)
  const session = useStore((s) => s.editor.aiSession)
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

  if (resume.experience.length === 0) {
    return (
      <div>
        <SectionHeader title="Experience" subtitle="No experience yet." />
        <button type="button" className="editor-btn-sm y" onClick={addExperience}>
          + ADD EXPERIENCE
        </button>
      </div>
    )
  }

  return (
    <div>
      {resume.experience.map((exp, expIndex) => {
        const subtitle = [exp.role, formatRange(exp.startDate, exp.endDate)]
          .filter(Boolean)
          .join(' · ')
        const hasClients = !!exp.clients && exp.clients.length > 0

        return (
          <div key={expIndex} style={{ marginBottom: 48 }}>
            <SectionHeader
              title={exp.company}
              subtitle={subtitle}
              rightSlot={
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <RewriteBlockButton
                    id={`rewrite-btn-experience-description-${expIndex}`}
                    label="REWRITE"
                    disabled={!!blockSession}
                    onClick={() =>
                      guardedRewrite(() =>
                        dispatchBlockRewrite(
                          { blockType: 'experience-description', expIndex },
                          { blockType: 'experience-description', text: exp.description ?? '' },
                        )
                      )
                    }
                  />
                  <button
                    type="button"
                    className="editor-btn-sm"
                    onClick={() => removeExperience(expIndex)}
                    title="Remove experience"
                  >
                    ✕
                  </button>
                </div>
              }
              onEdit={() => {
                const next = window.prompt('Company name', exp.company)
                if (next !== null) updateExperienceField(expIndex, 'company', next)
              }}
            />

            {/* Experience description (intro line) */}
            {exp.description && (
              <p style={{ fontSize: 13, color: '#555', margin: '4px 0 12px', lineHeight: 1.5, fontStyle: 'italic' }}>
                {exp.description}
              </p>
            )}

            {hasClients ? (
              exp.clients!.map((client, clientIndex) => {
                const isLast = clientIndex === exp.clients!.length - 1
                const parent = {
                  section: 'experience' as const,
                  expIndex,
                  clientIndex,
                }
                return (
                  <Fragment key={clientIndex}>
                    <ClientMetaStrip
                      name={client.name}
                      tech={client.tech}
                      startDate={client.startDate}
                      endDate={client.endDate}
                    />
                    {client.bullets.map((text, bulletIndex) => {
                      const path = {
                        section: 'experience' as const,
                        expIndex,
                        clientIndex,
                        bulletIndex,
                      }
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
                      onRequestAi={(rough) =>
                        dispatchRewrite({ section: 'new-bullet', parent }, rough)
                      }
                    />
                    {/* REWRITE ALL BULLETS for this client */}
                    <div style={{ marginTop: 8, marginBottom: 4 }}>
                      <RewriteBlockButton
                        id={`rewrite-btn-experience-bullets-${expIndex}-${clientIndex}`}
                        label="REWRITE ALL BULLETS"
                        disabled={!client.bullets.length || !!blockSession}
                        onClick={() =>
                          guardedRewrite(() =>
                            dispatchBlockRewrite(
                              { blockType: 'experience-bullets', expIndex, clientIndex },
                              { blockType: 'experience-bullets', bullets: client.bullets },
                            )
                          )
                        }
                      />
                    </div>
                    {!isLast && <hr className="editor-dashed-divider" />}
                  </Fragment>
                )
              })
            ) : (
              <FlatExperience
                expIndex={expIndex}
                bullets={exp.bullets ?? []}
                role={exp.role}
                startDate={exp.startDate}
                endDate={exp.endDate}
                blockSession={!!blockSession}
                guardedRewrite={guardedRewrite}
              />
            )}
          </div>
        )
      })}

      <button
        type="button"
        className="editor-btn-sm y"
        onClick={addExperience}
        style={{ marginTop: 16 }}
      >
        + ADD EXPERIENCE
      </button>
    </div>
  )
}

function FlatExperience({
  expIndex,
  bullets,
  role,
  startDate,
  endDate,
  blockSession,
  guardedRewrite,
}: {
  expIndex: number
  bullets: string[]
  role: string
  startDate: string
  endDate: string
  blockSession: boolean
  guardedRewrite: (fn: () => void) => void
}) {
  const session = useStore((s) => s.editor.aiSession)
  const parent = { section: 'experience' as const, expIndex, clientIndex: null }
  return (
    <>
      <ClientMetaStrip
        label="ROLE"
        name={role || '—'}
        startDate={startDate}
        endDate={endDate}
      />
      {bullets.map((text, bulletIndex) => {
        const path = {
          section: 'experience' as const,
          expIndex,
          clientIndex: null,
          bulletIndex,
        }
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
        onRequestAi={(rough) =>
          dispatchRewrite({ section: 'new-bullet', parent }, rough)
        }
      />
      {/* REWRITE ALL BULLETS for flat experience */}
      <div style={{ marginTop: 8 }}>
        <RewriteBlockButton
          id={`rewrite-btn-experience-bullets-${expIndex}-null`}
          label="REWRITE ALL BULLETS"
          disabled={!bullets.length || blockSession}
          onClick={() =>
            guardedRewrite(() =>
              dispatchBlockRewrite(
                { blockType: 'experience-bullets', expIndex, clientIndex: null },
                { blockType: 'experience-bullets', bullets },
              )
            )
          }
        />
      </div>
    </>
  )
}

function formatRange(start?: string, end?: string): string | null {
  if (!start && !end) return null
  if (start && end) return `${start} – ${end}`
  return start ?? end ?? null
}
