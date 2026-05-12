'use client'

import { resolveClientProvider } from '@/lib/llm-client'
import { useTailorStore } from '@/lib/store/useTailorStore'

const PROVIDER_LABEL: Record<string, string> = {
  ollama: 'OLLAMA LOCAL',
  groq: 'GROQ CLOUD',
  gemini: 'GEMINI CLOUD',
}

function getProviderLabel(): string {
  return PROVIDER_LABEL[resolveClientProvider()] ?? 'OLLAMA LOCAL'
}

export default function StatusBar() {
  const profiles = useTailorStore((s) => s.profiles)
  const activeProfileId = useTailorStore((s) => s.activeProfileId)
  const result = useTailorStore((s) => s.result)
  const analysing = useTailorStore((s) => s.analysing)
  const error = useTailorStore((s) => s.error)

  const activeProfile = activeProfileId
    ? profiles.find((p) => p.id === activeProfileId)
    : null

  const leftLabel = activeProfile
    ? `${activeProfile.name.toUpperCase()} JD LOADED`
    : 'NEW JD'

  const provider = getProviderLabel()

  let rightSegment: React.ReactNode
  if (error) {
    rightSegment = (
      <span>
        <b style={{ color: 'var(--red)' }}>ERROR — RETRY</b>{' '}
        <span style={{ color: '#444' }}>·</span> {provider}
      </span>
    )
  } else if (analysing) {
    rightSegment = (
      <span>
        <b style={{ color: 'var(--y)' }}>ANALYSING...</b>{' '}
        <span style={{ color: '#444' }}>·</span> {provider}
      </span>
    )
  } else if (result) {
    rightSegment = (
      <span>
        MATCH: <b style={{ color: 'var(--y)' }}>{result.matchScore}/100</b>{' '}
        <span style={{ color: '#444' }}>·</span> {result.keywords.missing.length} GAPS{' '}
        <span style={{ color: '#444' }}>·</span> {provider}
      </span>
    )
  } else {
    rightSegment = (
      <span>
        MATCH: — <span style={{ color: '#444' }}>·</span> 0 GAPS{' '}
        <span style={{ color: '#444' }}>·</span> {provider}
      </span>
    )
  }

  return (
    <footer className="editor-statusbar">
      <div>
        CRAFTCV <span style={{ color: '#444' }}>·</span> TAILOR MODE{' '}
        <span style={{ color: '#444' }}>·</span> {leftLabel}
      </div>
      <div>{rightSegment}</div>
    </footer>
  )
}
