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

  const heading =
    !status || status.provider === 'ollama'
      ? 'AI USAGE (LOCAL)'
      : status.provider === 'groq'
        ? 'AI USAGE (GROQ)'
        : 'AI USAGE (GEMINI)'

  if (!status) {
    return (
      <div className="editor-ai-usage">
        <div className="editor-score-h">{heading}</div>
        <div style={{ color: '#888', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          checking…
        </div>
      </div>
    )
  }

  const remaining =
    status.usage != null ? status.usage.limit - status.usage.used : null
  const usedPct =
    status.usage != null ? Math.min(100, (status.usage.used / status.usage.limit) * 100) : 0

  return (
    <div className="editor-ai-usage">
      <div className="editor-score-h">{heading}</div>
      <div className="provider">
        <span className="pill">{status.provider.toUpperCase()}</span>
        <span>
          {status.provider === 'ollama'
            ? 'UNLIMITED'
            : remaining != null
              ? `${remaining.toLocaleString()} / ${status.usage!.limit.toLocaleString()} LEFT TODAY`
              : 'CONNECTED'}
        </span>
      </div>

      {status.provider !== 'ollama' && remaining != null && (
        <div style={{ marginTop: 4 }}>
          <div
            style={{
              height: 4,
              background: '#E8E8E8',
              border: '1px solid #ccc',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${usedPct}%`,
                background: usedPct >= 90 ? 'var(--red, #e53)' : usedPct >= 70 ? '#FFD600' : '#5CB85C',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#888',
              marginTop: 3,
              letterSpacing: 0.5,
            }}
          >
            {Math.round(usedPct)}% USED · RESETS DAILY
          </div>
        </div>
      )}

      <div className="model">{status.model.rewrite} — rewrites</div>
      <div className="model">{status.model.score} — scoring</div>
      <div className="status">
        <span className={'dot ' + STATUS_DOT[status.status]} />
        {STATUS_LABEL[status.status]}
      </div>
    </div>
  )
}
