'use client'

import { useRouter } from 'next/navigation'
import AiUsageBlock from './AiUsageBlock'
import FixThese from './FixThese'
import ResumeScoreBlock from './ResumeScoreBlock'
import { bulletElementId } from '@/lib/editor/bulletId'
import { useScore } from '@/lib/editor/score/useScore'
import { useStore } from '@/lib/store'
import type { FixTarget } from '@/lib/types'

export default function RightSidebar() {
  const router = useRouter()
  const score = useScore()

  function onJump(target: FixTarget) {
    if (target.kind === 'section') {
      useStore.getState().setActiveSection(target.section)
      return
    }
    if (target.kind === 'bullet') {
      const sec = target.path.section === 'experience' ? 'experience' : 'projects'
      useStore.getState().setActiveSection(sec)
      requestAnimationFrame(() => {
        document
          .getElementById(bulletElementId(target.path))
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
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
