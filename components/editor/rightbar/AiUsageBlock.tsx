'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import type { LlmStatus } from '@/lib/types'

const STATUS_LABEL: Record<LlmStatus['status'], string> = {
  running: 'MODEL RUNNING',
  connected: 'CONNECTED',
  'rate-limited': 'RATE LIMITED',
  down: 'OFFLINE',
}

const STATUS_DOT: Record<LlmStatus['status'], string> = {
  running: 'green',
  connected: 'green',
  'rate-limited': 'red',
  down: 'red',
}

export default function AiUsageBlock() {
  const [status, setStatus] = useState<LlmStatus | null>(null)
  const aiStreaming = useStore((s) => s.editor.aiSession?.streaming ?? false)

  // initial fetch + refresh after each rewrite stream completes
  useEffect(() => {
    let cancelled = false
    void fetch('/api/llm-status')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setStatus(data as LlmStatus)
      })
      .catch(() => {
        /* ignore */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Refetch after a stream completes (true → false transition)
  const wasStreaming = useRef(false)
  useEffect(() => {
    if (!aiStreaming && wasStreaming.current) {
      void fetch('/api/llm-status')
        .then((r) => r.json())
        .then((data) => setStatus(data as LlmStatus))
        .catch(() => {
          /* ignore */
        })
    }
    wasStreaming.current = aiStreaming
  }, [aiStreaming])

  if (!status) {
    return (
      <div className="editor-ai-usage">
        <div className="editor-score-h">AI USAGE (LOCAL)</div>
        <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          checking…
        </div>
      </div>
    )
  }

  const usageLine =
    status.provider === 'ollama'
      ? 'UNLIMITED'
      : status.usage
        ? `${status.usage.used}/${status.usage.limit}/DAY`
        : status.provider.toUpperCase()

  return (
    <div className="editor-ai-usage">
      <div className="editor-score-h">AI USAGE (LOCAL)</div>
      <div className="provider">
        <span className="pill">{status.provider.toUpperCase()}</span>
        <span>{usageLine}</span>
      </div>
      <div className="model">{status.model.rewrite} — rewrites</div>
      <div className="model">{status.model.score} — scoring</div>
      <div className="status">
        <span className={'dot ' + STATUS_DOT[status.status]} />
        {STATUS_LABEL[status.status]}
      </div>
    </div>
  )
}
