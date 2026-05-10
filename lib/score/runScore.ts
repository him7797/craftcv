import type { Resume, DashboardScoreResult } from '@/lib/types'
import { computeScore } from './computeScore'
import { compactResume } from '@/lib/tailor/prompts/tailorAnalysis'
import { refineWithAi, ScoreRefineError } from './refineWithAi'
import { mergeScores } from './mergeScores'
import { getActiveProvider } from './modelLabels'

const STALENESS_MS = 5 * 60 * 1000

export function isStale(result: DashboardScoreResult, contentHash: string): boolean {
  if (result.scoredContentHash !== contentHash) return true
  const ageMs = Date.now() - new Date(result.scoredAt).getTime()
  return ageMs > STALENESS_MS
}

/**
 * Full pipeline: deterministic prepass + optional AI refinement + merge.
 * On AI failure, returns a fallback result with `aiAvailable: false`.
 */
export async function runScore(resume: Resume): Promise<DashboardScoreResult> {
  const pre = computeScore(resume)
  const overallPre = Math.round(
    0.3 * pre.subscoresPre.impact +
      0.2 * pre.subscoresPre.language +
      0.25 * pre.subscoresPre.tailoring +
      0.15 * pre.subscoresPre.format +
      0.1 * pre.subscoresPre.length,
  )
  const band: 'NEEDS WORK' | 'OK' | 'GOOD' | 'GREAT' =
    overallPre >= 90 ? 'GREAT' : overallPre >= 75 ? 'GOOD' : overallPre >= 60 ? 'OK' : 'NEEDS WORK'

  const allIssues = [
    ...pre.issuesByAxis.impact,
    ...pre.issuesByAxis.language,
    ...pre.issuesByAxis.tailoring,
    ...pre.issuesByAxis.format,
    ...pre.issuesByAxis.length,
  ]

  const scoredAt = new Date().toISOString()
  const provider = getActiveProvider()

  let refine = null
  let modelUsed = 'rule-based'
  let resolvedProvider: 'ollama' | 'groq' | 'gemini' | 'fallback' = 'fallback'

  try {
    const result = await refineWithAi({
      resumeCompact: compactResume(resume),
      subscoresPre: pre.subscoresPre,
      issues: allIssues,
      band,
    })
    refine = result
    modelUsed = result.model
    resolvedProvider = (result.provider as 'ollama' | 'groq' | 'gemini') ?? provider
  } catch (err) {
    if (!(err instanceof ScoreRefineError)) {
      // Non-error throw — re-throw for caller to handle
      throw err
    }
    // AI step failed — fall back to deterministic-only
  }

  return mergeScores({
    pre,
    refine,
    contentHash: pre.contentHash,
    scoredAt,
    modelUsed,
    provider: resolvedProvider,
  })
}
