'use client'

import type { ExtractionSummary, ParseResult, ScoreResult } from '@/lib/types'
import FileCard from './FileCard'

interface ParseSuccessProps {
  file: File
  result: Extract<ParseResult, { status: 'success' }>
  onReUpload: () => void
  onContinue: () => void
}

function StatCard({
  label,
  count,
  sub,
}: {
  label: string
  count: number | string
  sub: string
}) {
  return (
    <div
      style={{
        flex: 1,
        background: '#FAFAFA',
        border: '2px solid #0D0D0D',
        boxShadow: '3px 3px 0 #0D0D0D',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#888',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 32,
          fontWeight: 700,
          color: '#0D0D0D',
          lineHeight: 1,
        }}
      >
        {count}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: '#666',
        }}
      >
        {sub}
      </p>
    </div>
  )
}

function ScorePill({ score }: { score: ScoreResult }) {
  const bandLabel =
    score.band === 'great' ? 'GREAT' : score.band === 'good' ? 'GOOD' : 'NEEDS WORK'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: '#FFD600',
        border: '2px solid #0D0D0D',
        boxShadow: '4px 4px 0 #0D0D0D',
        padding: '20px 40px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 42,
          fontWeight: 700,
          color: '#0D0D0D',
          lineHeight: 1,
        }}
      >
        {score.score}
        <span style={{ fontSize: 18, fontWeight: 400 }}>/100</span>
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 2,
          fontWeight: 700,
          color: '#0D0D0D',
        }}
      >
        {bandLabel}
      </p>
    </div>
  )
}

function extractionStats(summary: ExtractionSummary) {
  return [
    {
      label: 'Header',
      count: summary.header ? 1 : 0,
      sub: 'NAME · EMAIL · LINKS',
    },
    {
      label: 'Experience',
      count: summary.experience.positions,
      sub: `POSITIONS · ${summary.experience.bullets} BULLETS`,
    },
    {
      label: 'Skills',
      count: summary.skills.categories,
      sub: `CATEGORIES · ${summary.skills.items} ITEMS`,
    },
    {
      label: 'Education',
      count: summary.education,
      sub: 'ENTRIES',
    },
    ...(summary.projects > 0
      ? [{ label: 'Projects', count: summary.projects, sub: 'ENTRIES' }]
      : []),
  ]
}

export default function ParseSuccess({ file, result, onReUpload, onContinue }: ParseSuccessProps) {
  const stats = extractionStats(result.extractionSummary)
  const highIssues = result.score.issues.filter((i) => i.impact === 'high').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%' }}>
      <FileCard file={file} badge="success" />

      <div
        style={{
          width: 720,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          alignItems: 'center',
        }}
      >
        {/* Heading */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: '#0D0D0D',
            alignSelf: 'flex-start',
          }}
        >
          FOUND IN YOUR RESUME
        </p>

        {/* Extraction grid */}
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} count={s.count} sub={s.sub} />
          ))}
        </div>

        {/* Score pill */}
        <ScorePill score={result.score} />

        {/* Teaser */}
        {highIssues > 0 && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: '#555',
              letterSpacing: 0.5,
            }}
          >
            {highIssues} high-impact fix{highIssues > 1 ? 'es' : ''} ready in the Editor.
          </p>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-y btn-lg" onClick={onContinue}>
            Continue to Editor →
          </button>
          <button type="button" className="btn btn-w btn-lg" onClick={onReUpload}>
            Re-Upload
          </button>
        </div>
      </div>
    </div>
  )
}
