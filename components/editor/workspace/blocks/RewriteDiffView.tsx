'use client'

import DiffColumn from './DiffColumn'
import DiffSkillsGrid from './DiffSkillsGrid'
import type { BlockRewriteSession } from '@/lib/types'

type Props = {
  session: BlockRewriteSession
}

export default function RewriteDiffView({ session }: Props) {
  const { suggestion, streaming, rawStreamText } = session

  const isSkills = session.blockPath.blockType === 'skills-section'

  if (isSkills && suggestion) {
    return (
      <DiffSkillsGrid
        before={
          suggestion.before.blockType === 'skills-section' ? suggestion.before.categories : []
        }
        after={
          suggestion.after.blockType === 'skills-section' ? suggestion.after.categories : []
        }
        diff={suggestion.diff}
      />
    )
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      <DiffColumn
        side="before"
        content={suggestion?.before ?? session.previousContent}
        diff={suggestion?.diff}
      />

      {/* Vertical divider */}
      <div style={{ width: 2, background: '#000', flexShrink: 0 }} />

      <DiffColumn
        side="after"
        content={suggestion?.after ?? null}
        streaming={streaming}
        rawStreamText={rawStreamText}
        diff={suggestion?.diff}
      />
    </div>
  )
}
