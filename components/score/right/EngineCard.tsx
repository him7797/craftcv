'use client'

import { useEffect, useState } from 'react'
import { useScoreStore } from '@/lib/store/useScoreStore'
import { getActiveProvider, getModelLabel, getProviderLabel } from '@/lib/score/modelLabels'
import type { AiEngineStatus } from '@/lib/types'

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'NEVER'
  const diffMs = Date.now() - new Date(iso).getTime()
  const s = Math.max(0, Math.floor(diffMs / 1000))
  if (s < 5) return 'JUST NOW'
  if (s < 60) return `${s} SEC AGO`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} MIN AGO`
  const h = Math.floor(m / 60)
  return `${h} HR AGO`
}

function deriveStatus(scoring: boolean, aiAvailable: boolean | undefined): AiEngineStatus {
  if (scoring) return 'scoring'
  if (aiAvailable === false) return 'unavailable'
  return 'idle'
}

const STATUS_LABEL: Record<AiEngineStatus, string> = {
  idle: 'MODEL IDLE · READY',
  scoring: 'SCORING IN PROGRESS',
  unavailable: 'MODEL UNAVAILABLE',
}

const STATUS_COLOR: Record<AiEngineStatus, 'green' | 'yellow' | 'red'> = {
  idle: 'green',
  scoring: 'yellow',
  unavailable: 'red',
}

export default function EngineCard() {
  const result = useScoreStore((s) => s.result)
  const scoring = useScoreStore((s) => s.scoring)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const activeProvider = result?.aiAvailable ? result.provider : getActiveProvider()
  const model = getModelLabel(activeProvider)
  const providerLabel = getProviderLabel(activeProvider)
  const status = deriveStatus(scoring, result?.aiAvailable)
  const colorClass = STATUS_COLOR[status]

  return (
    <div className="score-engine-card">
      <div className="score-engine-row">
        <span className="score-engine-label">Scoring Model</span>
        <span className="score-engine-pill">{model}</span>
      </div>
      <div className="score-engine-row">
        <span className="score-engine-label">Running on</span>
        <span className="score-engine-value">{providerLabel}</span>
      </div>
      <div className="score-engine-row">
        <span className="score-engine-label">Last scored</span>
        <span className="score-engine-value">{relativeTime(result?.scoredAt)}</span>
      </div>
      <div className="score-engine-row">
        <span className="score-engine-label">Cost</span>
        <span className="score-engine-value">$0.00</span>
      </div>
      <hr className="score-engine-divider" />
      <div className={`score-engine-status ${colorClass}`}>
        <span className={`score-status-dot ${colorClass}`} />
        {STATUS_LABEL[status]}
      </div>
    </div>
  )
}
