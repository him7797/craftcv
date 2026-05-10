'use client'

import { useTailorStore } from '@/lib/store/useTailorStore'
import SavedProfileRow from './SavedProfileRow'

export default function SavedProfilesList() {
  const profiles = useTailorStore((s) => s.profiles)
  const activeProfileId = useTailorStore((s) => s.activeProfileId)
  const loadProfile = useTailorStore((s) => s.loadProfile)

  if (profiles.length === 0) {
    return (
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#888',
          padding: '14px 18px',
          background: 'var(--g)',
        }}
      >
        No saved profiles yet.
      </div>
    )
  }

  return (
    <>
      <div className="tailor-side-sub">SAVED PROFILES</div>
      <div className="tailor-saved-list">
        {profiles.map((p) => (
          <SavedProfileRow
            key={p.id}
            profile={p}
            isActive={p.id === activeProfileId}
            onClick={() => loadProfile(p.id)}
          />
        ))}
      </div>
    </>
  )
}
