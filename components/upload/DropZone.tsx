'use client'

import { useRef, useState } from 'react'

interface DropZoneProps {
  onFileSelect: (file: File) => void
}

const MAX_SIZE = 10 * 1024 * 1024

function validate(file: File): string | null {
  const name = file.name.toLowerCase()
  const ext = name.slice(name.lastIndexOf('.'))
  if (ext === '.doc') return 'Old .doc format not supported. Save as .docx and try again.'
  if (ext !== '.pdf' && ext !== '.docx') return 'PDF or DOCX only.'
  if (file.size === 0) return 'File appears to be empty.'
  if (file.size > MAX_SIZE) return 'File too large (max 10MB).'
  return null
}

export default function DropZone({ onFileSelect }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const err = validate(file)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    onFileSelect(file)
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function onDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <label
        aria-label="Resume drop zone — drag and drop or click to browse"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 720,
          minHeight: 360,
          background: isDragOver ? '#FFD600' : '#FAFAFA',
          border: isDragOver ? '3px solid #0D0D0D' : '2px solid #0D0D0D',
          boxShadow: '6px 6px 0 #0D0D0D',
          position: 'relative',
          cursor: 'pointer',
          gap: 0,
          // pixel-grid dot pattern
          backgroundImage: isDragOver
            ? 'none'
            : 'radial-gradient(circle, #0D0D0D 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          backgroundBlendMode: 'normal',
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          aria-label="Select resume file"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
          onChange={onInputChange}
        />

        {/* File icon */}
        <div
          style={{
            width: 44,
            height: 44,
            background: '#FFD600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isDragOver ? 'scale(1.15)' : 'scale(1)',
            marginBottom: 24,
            border: '2px solid #0D0D0D',
          }}
        >
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
            <rect x="1" y="1" width="14" height="18" stroke="#0D0D0D" strokeWidth="2" fill="none" />
            <path d="M15 1L21 7V24H7" stroke="#0D0D0D" strokeWidth="2" fill="none" />
            <path d="M15 1V7H21" stroke="#0D0D0D" strokeWidth="2" />
            <path d="M4 11H12M4 14H10M4 17H8" stroke="#0D0D0D" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Heading */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 2,
            color: '#0D0D0D',
            marginBottom: 12,
            textTransform: 'uppercase',
          }}
        >
          {isDragOver ? 'DROP IT' : 'DROP YOUR RESUME'}
        </p>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#666',
            letterSpacing: 1,
            marginBottom: 32,
          }}
        >
          PDF or DOCX · max 10MB · stays on your machine
        </p>

        {/* Divider */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#888',
            letterSpacing: 1,
            marginBottom: 16,
          }}
        >
          or
        </p>

        {/* Browse button */}
        <button
          type="button"
          className="btn btn-y"
          style={{ fontSize: 11 }}
          onClick={(e) => {
            e.preventDefault()
            inputRef.current?.click()
          }}
          onFocus={(e) => { e.currentTarget.style.outline = '2px solid #FFD600' }}
          onBlur={(e) => { e.currentTarget.style.outline = '' }}
        >
          Browse Files
        </button>

        {/* Error */}
        {error && (
          <p
            style={{
              position: 'absolute',
              bottom: 16,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: '#C42B2B',
              letterSpacing: 0.5,
            }}
          >
            ⚠ {error}
          </p>
        )}
      </label>

      {/* Extract chips */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['HEADER', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'PROJECTS'].map((chip) => (
          <span
            key={chip}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 1,
              padding: '4px 10px',
              border: '1px solid #0D0D0D',
              color: '#555',
              background: '#FAFAFA',
            }}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}
