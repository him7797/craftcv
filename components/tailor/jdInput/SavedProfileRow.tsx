'use client'

import type { JdProfile } from '@/lib/types'

type Props = {
  profile: JdProfile
  isActive: boolean
  onClick: () => void
}

export default function SavedProfileRow({ profile, isActive, onClick }: Props) {
  return (
    <button
      type="button"
      className={`tailor-saved-row${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      {profile.name}
    </button>
  )
}
