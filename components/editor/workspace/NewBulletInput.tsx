'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'

type ParentPath =
  | { section: 'experience'; expIndex: number; clientIndex: number | null }
  | { section: 'projects'; projectIndex: number }

type Props = {
  parent: ParentPath
  onRequestAi?: (rough: string) => void
  modelHint?: string
}

export default function NewBulletInput({ parent, onRequestAi, modelHint }: Props) {
  const addBullet = useStore((s) => s.addBullet)
  const [value, setValue] = useState('')
  const placeholder =
    'Type a rough bullet — Tab to AI rewrite' +
    (modelHint ? ` (${modelHint})` : '') +
    ', Enter to add as-is'

  function fireAi() {
    const v = value.trim()
    if (!v) return
    if (onRequestAi) onRequestAi(v)
    setValue('')
  }

  function addAsIs() {
    const v = value.trim()
    if (!v) return
    addBullet(parent, v)
    setValue('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab' && value.trim()) {
      e.preventDefault()
      fireAi()
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      addAsIs()
    }
  }

  return (
    <div className="editor-new-bullet">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="editor-bullet-btn b"
        onClick={fireAi}
        disabled={!value.trim()}
      >
        AI ✦
      </button>
    </div>
  )
}
