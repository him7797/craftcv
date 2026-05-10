'use client'

import { Fragment } from 'react'
import AiSuggestionCard from '../AiSuggestionCard'
import BulletRow from '../BulletRow'
import ClientMetaStrip from '../ClientMetaStrip'
import NewBulletInput from '../NewBulletInput'
import SectionHeader from '../SectionHeader'
import { dispatchRewrite } from '@/lib/editor/aiDispatch'
import { isParentMatch, isPathMatch } from '@/lib/editor/aiMatch'
import { useStore } from '@/lib/store'
import type { Resume } from '@/lib/types'

export default function ExperienceSection({ resume }: { resume: Resume }) {
  const addExperience = useStore((s) => s.addExperience)
  const removeExperience = useStore((s) => s.removeExperience)
  const updateExperienceField = useStore((s) => s.updateExperienceField)
  const session = useStore((s) => s.editor.aiSession)

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
                <button
                  type="button"
                  className="editor-btn-sm"
                  onClick={() => removeExperience(expIndex)}
                  title="Remove experience"
                >
                  ✕
                </button>
              }
              onEdit={() => {
                const next = window.prompt('Company name', exp.company)
                if (next !== null) updateExperienceField(expIndex, 'company', next)
              }}
            />

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
}: {
  expIndex: number
  bullets: string[]
  role: string
  startDate: string
  endDate: string
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
    </>
  )
}

function formatRange(start?: string, end?: string): string | null {
  if (!start && !end) return null
  if (start && end) return `${start} – ${end}`
  return start ?? end ?? null
}
