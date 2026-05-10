'use client'

import { useEffect, useState } from 'react'
import { useTailorStore } from '@/lib/store/useTailorStore'

const MODEL_LABEL: Record<string, string> = {
  ollama: 'QWEN2.5:14B',
  groq: 'LLAMA-3.3-70B',
  gemini: 'GEMINI FLASH',
}

function getProvider(): 'ollama' | 'groq' | 'gemini' {
  const v = (process.env.NEXT_PUBLIC_LLM_PROVIDER ?? 'ollama').toLowerCase()
  if (v === 'groq' || v === 'gemini') return v
  return 'ollama'
}

const GLYPH_FRAMES = ['▸', '▹', '▸', '▹']

export default function AnalyseButton({
  onAnalyse,
}: {
  onAnalyse: () => void
}) {
  const analysing = useTailorStore((s) => s.analysing)
  const draftJdText = useTailorStore((s) => s.draftJdText)
  const provider = getProvider()
  const modelLabel = MODEL_LABEL[provider]

  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!analysing) return
    const id = setInterval(() => setFrame((f) => (f + 1) % GLYPH_FRAMES.length), 400)
    return () => clearInterval(id)
  }, [analysing])

  const disabled = analysing || draftJdText.trim().length === 0

  return (
    <button
      type="button"
      className="tailor-analyse"
      disabled={disabled}
      onClick={onAnalyse}
    >
      {analysing ? (
        <>
          ANALYSING<span style={{ display: 'inline-block', width: 16 }}>{GLYPH_FRAMES[frame]}</span>
        </>
      ) : (
        <>
          ANALYSE WITH {modelLabel}
          <span className="glyph">✦</span>
        </>
      )}
    </button>
  )
}
