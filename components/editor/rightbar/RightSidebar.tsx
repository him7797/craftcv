'use client'

import { useRouter } from 'next/navigation'
import AiUsageBlock from './AiUsageBlock'
import FixThese from './FixThese'
import ResumeScoreBlock from './ResumeScoreBlock'
import { useScore } from '@/lib/editor/score/useScore'
import { dispatchBlockRewrite, extractBlockContent } from '@/lib/editor/blockRewriteDispatch'
import { useStore } from '@/lib/store'
import type { BulletPath, BlockPath, FixTarget } from '@/lib/types'

function bulletPathToBlockPath(path: BulletPath): BlockPath {
  if (path.section === 'experience') {
    return { blockType: 'experience-bullets', expIndex: path.expIndex, clientIndex: path.clientIndex }
  }
  return { blockType: 'project-block', projectIndex: path.projectIndex }
}

export default function RightSidebar() {
  const router = useRouter()
  const score = useScore()

  function onJump(target: FixTarget) {
    if (target.kind === 'bullet') {
      const { versions, editor } = useStore.getState()
      const resume = versions[editor.activeVersionId]?.resume
      if (!resume) return
      const blockPath = bulletPathToBlockPath(target.path)
      const content = extractBlockContent(blockPath, resume)
      if (content) dispatchBlockRewrite(blockPath, content)
      return
    }
    if (target.kind === 'section') {
      useStore.getState().setActiveSection(target.section)
      return
    }
    router.push('/' + target.tab)
  }

  return (
    <aside className="editor-sidebar-r">
      <ResumeScoreBlock score={score} />
      <FixThese fixes={score.fixes} onJump={onJump} />
      <AiUsageBlock />
    </aside>
  )
}
