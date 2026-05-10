'use client'

import { useRouter } from 'next/navigation'
import type { ScoreActionItemTarget } from '@/lib/types'
import { buildEditorFocusUrl } from '@/lib/score/handoff'

type Props = {
  label: string
  target: ScoreActionItemTarget
}

export default function ActionLink({ label, target }: Props) {
  const router = useRouter()
  return (
    <button
      type="button"
      className="score-action-link"
      onClick={() => router.push(buildEditorFocusUrl(target))}
    >
      → <u>{label}</u>
    </button>
  )
}
