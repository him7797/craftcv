'use client'

import { useEffect, useRef, useState } from 'react'
import { useTailorStore } from '@/lib/store/useTailorStore'

type Props = {
  open: boolean
  onClose: () => void
}

export default function SaveJdModal({ open, onClose }: Props) {
  // Component only renders while `open` is true (see early return below);
  // unmounting on close means the input naturally resets on next open.
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const saveCurrentAsProfile = useTailorStore((s) => s.saveCurrentAsProfile)

  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    saveCurrentAsProfile(trimmed)
    onClose()
  }

  return (
    <div className="tailor-modal-backdrop" onClick={onClose}>
      <div
        className="tailor-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="tailor-modal-h">NAME THIS JD PROFILE</div>
        <input
          ref={inputRef}
          className="tailor-modal-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Stripe — Backend Engineer"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
        />
        <div className="tailor-modal-actions">
          <button type="button" className="btn btn-w" onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className="btn btn-y"
            onClick={submit}
            disabled={name.trim().length === 0}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  )
}
