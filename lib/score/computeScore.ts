import type { Resume, ScoreAxis } from '@/lib/types'
import { computeImpactScore } from './rules/computeImpactScore'
import { computeLanguageRegex } from './rules/computeLanguageRegex'
import { computeFormatScore } from './rules/computeFormatScore'
import { computeLengthScore } from './rules/computeLengthScore'
import { readTailoringScore } from './rules/readTailoringScore'

export type ScoreIssueStub = {
  id: string
  axis: ScoreAxis
  title: string
  state: 'open' | 'resolved'
  excerpt?: string
  scoreImpact: number
}

export type RuleOutput = {
  axis: ScoreAxis
  score: number
  issues: ScoreIssueStub[]
}

export type SubScoresPre = {
  impact: number
  language: number
  tailoring: number
  format: number
  length: number
}

export type ComputeScoreResult = {
  subscoresPre: SubScoresPre
  issuesByAxis: Record<ScoreAxis, ScoreIssueStub[]>
  contentHash: string
}

const WEIGHTS = {
  impact: 0.3,
  language: 0.2,
  tailoring: 0.25,
  format: 0.15,
  length: 0.1,
}

export function computeOverall(sub: SubScoresPre): number {
  return Math.round(
    WEIGHTS.impact * sub.impact +
      WEIGHTS.language * sub.language +
      WEIGHTS.tailoring * sub.tailoring +
      WEIGHTS.format * sub.format +
      WEIGHTS.length * sub.length,
  )
}

export function computeOverallWithReplacement(
  sub: SubScoresPre,
  axis: ScoreAxis,
  replacement: number,
): number {
  const next = { ...sub, [axis]: replacement }
  return computeOverall(next)
}

/**
 * Stable, fast non-cryptographic hash over the resume's bullet text + skills + projects.
 * Used for the staleness check (FR-040). FNV-1a over a normalized string.
 */
export function computeContentHash(resume: Resume): string {
  const parts: string[] = []
  for (const exp of resume.experience) {
    parts.push(exp.role, exp.company)
    if (exp.bullets) parts.push(...exp.bullets)
    if (exp.clients) {
      for (const c of exp.clients) {
        parts.push(c.name)
        if (c.tech) parts.push(...c.tech)
        parts.push(...c.bullets)
      }
    }
  }
  for (const s of resume.skills) parts.push(s.category, ...s.items)
  if (resume.projects) {
    for (const p of resume.projects) {
      parts.push(p.name, p.description)
      if (p.tech) parts.push(...p.tech)
    }
  }
  const flat = parts.join('|')
  // FNV-1a 32-bit
  let hash = 0x811c9dc5
  for (let i = 0; i < flat.length; i++) {
    hash ^= flat.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function computeScore(resume: Resume): ComputeScoreResult {
  const impact = computeImpactScore(resume)
  const language = computeLanguageRegex(resume)
  const format = computeFormatScore(resume)
  const length = computeLengthScore(resume)
  const tailoring = readTailoringScore()

  return {
    subscoresPre: {
      impact: impact.score,
      language: language.score,
      tailoring: tailoring.score,
      format: format.score,
      length: length.score,
    },
    issuesByAxis: {
      impact: impact.issues,
      language: language.issues,
      tailoring: tailoring.issues,
      format: format.issues,
      length: length.issues,
    },
    contentHash: computeContentHash(resume),
  }
}

export { WEIGHTS as SCORE_WEIGHTS }
