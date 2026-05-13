'use client'

import { useEffect, useRef } from 'react'
import DiffBullet from './DiffBullet'
import type { BlockContent, DiffAnnotation } from '@/lib/types'

type Props = {
  side: 'before' | 'after'
  content: BlockContent | null
  streaming?: boolean
  rawStreamText?: string
  diff?: DiffAnnotation
}

function highlightText(text: string, diff: DiffAnnotation, side: 'before' | 'after'): React.ReactNode {
  if (!diff) return text

  if (side === 'after') {
    // Added phrases: yellow background
    const result: string = text
    const addedPhrases = diff.added.filter((p) => result.toLowerCase().includes(p.toLowerCase()))
    if (addedPhrases.length === 0 && diff.modified.length === 0) return text

    // Simple approach: render as plain text with full yellow bg for added spans
    return (
      <span>
        {text.split(/(\s+)/).map((word, i) => {
          const isAdded = diff.added.some((p) => p.toLowerCase().includes(word.toLowerCase().trim()) && word.trim().length > 2)
          const isModified = diff.modified.some((m) => m.to.toLowerCase().includes(word.toLowerCase().trim()) && word.trim().length > 2)
          if (isAdded) {
            return <mark key={i} style={{ background: '#FFD600', padding: '0 2px' }}>{word}</mark>
          }
          if (isModified) {
            return <span key={i} style={{ borderBottom: '2px solid #FFD600' }}>{word}</span>
          }
          return word
        })}
      </span>
    )
  } else {
    // Removed phrases: red strikethrough
    return (
      <span>
        {text.split(/(\s+)/).map((word, i) => {
          const isRemoved = diff.removed.some((p) => p.toLowerCase().includes(word.toLowerCase().trim()) && word.trim().length > 2)
          if (isRemoved) {
            return (
              <span key={i} style={{ color: '#C42B2B', textDecoration: 'line-through' }}>
                {word}
              </span>
            )
          }
          return word
        })}
      </span>
    )
  }
}

function renderContent(content: BlockContent, side: 'before' | 'after', diff?: DiffAnnotation): React.ReactNode {
  switch (content.blockType) {
    case 'experience-description':
      return (
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#111', margin: 0 }}>
          {diff ? highlightText(content.text, diff, side) : content.text}
        </p>
      )

    case 'experience-bullets':
      return (
        <ul style={{ margin: 0, padding: 0 }}>
          {content.bullets.map((bullet, i) => {
            const isAdded = side === 'after' && diff?.added.some((a) => bullet.toLowerCase().includes(a.toLowerCase().slice(0, 20)))
            const isRemoved = side === 'before' && diff?.removed.some((r) => bullet.toLowerCase().includes(r.toLowerCase().slice(0, 20)))
            return (
              <DiffBullet
                key={i}
                text={bullet}
                tag={isAdded ? 'added' : isRemoved ? 'removed' : undefined}
                side={side}
              />
            )
          })}
        </ul>
      )

    case 'project-block':
      return (
        <div style={{ fontSize: 13, lineHeight: 1.6, color: '#111' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{content.name}</div>
          <div style={{ marginBottom: 6, color: '#444' }}>
            {diff ? highlightText(content.description, diff, side) : content.description}
          </div>
          {content.tech.length > 0 && (
            <div style={{ marginBottom: 6, fontSize: 12, color: '#666' }}>
              <strong>Tech:</strong> {content.tech.join(', ')}
            </div>
          )}
          {content.bullets.length > 0 && (
            <ul style={{ margin: 0, padding: 0 }}>
              {content.bullets.map((bullet, i) => {
                const isAdded = side === 'after' && diff?.added.some((a) => bullet.toLowerCase().includes(a.toLowerCase().slice(0, 20)))
                const isRemoved = side === 'before' && diff?.removed.some((r) => bullet.toLowerCase().includes(r.toLowerCase().slice(0, 20)))
                return (
                  <DiffBullet
                    key={i}
                    text={bullet}
                    tag={isAdded ? 'added' : isRemoved ? 'removed' : undefined}
                    side={side}
                  />
                )
              })}
            </ul>
          )}
          {content.link && (
            <div style={{ marginTop: 6, fontSize: 12 }}>
              <a href={content.link} target="_blank" rel="noreferrer" style={{ color: '#0070f3' }}>
                {content.link}
              </a>
            </div>
          )}
        </div>
      )

    case 'skills-section':
      return (
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          {content.categories.map((cat, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.5px' }}>
                {cat.category}:
              </span>{' '}
              {cat.items.join(', ')}
            </div>
          ))}
        </div>
      )
  }
}

export default function DiffColumn({ side, content, streaming, rawStreamText, diff }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (streaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [streaming, rawStreamText])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '10px 16px',
          background: '#f8f8f8',
          borderBottom: '1px solid #e0e0e0',
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#555',
          flexShrink: 0,
        }}
      >
        {side === 'before' ? 'BEFORE' : 'AFTER'}
      </div>

      {/* Progress bar (streaming only) */}
      {side === 'after' && streaming && (
        <div style={{ height: 2, background: '#f0f0f0', flexShrink: 0, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              background: '#FFD600',
              width: '40%',
              animation: 'slide-progress 1.2s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px',
          position: 'relative',
        }}
      >
        {side === 'after' && streaming ? (
          <div style={{ fontSize: 13, lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {rawStreamText || (
              <span style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#FFD600', animation: 'pulse-dot 1s ease-in-out infinite' }} />
                Generating...
              </span>
            )}
          </div>
        ) : content ? (
          renderContent(content, side, diff)
        ) : (
          <span style={{ color: '#aaa', fontSize: 13 }}>—</span>
        )}
      </div>

      <style>{`
        @keyframes slide-progress {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
