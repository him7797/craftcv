'use client'

import { useRouter } from 'next/navigation'
import type { ScoreActionItemTarget } from '@/lib/types'
import { buildEditorFocusUrl, bulletIdToBlockPath } from '@/lib/score/handoff'
import { dispatchBlockRewrite, extractBlockContent } from '@/lib/editor/blockRewriteDispatch'
import { useBlockRewriteStore } from '@/lib/store/useBlockRewriteStore'
import { useStore } from '@/lib/store'

type Props = {
  label: string
  target: ScoreActionItemTarget
  onResolve?: () => void
}

export default function ActionLink({ label, target, onResolve }: Props) {
  const router = useRouter()

  function handleClick() {
    if (target.kind === 'editor-bullet') {
      const blockPath = bulletIdToBlockPath(target.bulletId)
      if (blockPath) {
        const storeState = useStore.getState()
        const resume = storeState.versions[storeState.editor.activeVersionId]?.resume
        const content = resume ? extractBlockContent(blockPath, resume) : null
        if (content) {
          if (onResolve) useBlockRewriteStore.getState().setOnAccepted(onResolve)
          dispatchBlockRewrite(blockPath, content)
          return
        }
      }
    }
    router.push(buildEditorFocusUrl(target))
  }

  return (
    <button type="button" className="score-action-link" onClick={handleClick}>
      → <u>{label}</u>
    </button>
  )
}
