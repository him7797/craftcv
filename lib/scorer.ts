import type { Resume, ScoreResult } from './types'
import { computeScore } from './editor/score/computeScore'

/**
 * Legacy adapter — keeps the upload-page consumer (`useStore.setParseResult`)
 * working. New editor code should call `computeScore(resume)` directly.
 */
export function scoreResume(resume: Resume): ScoreResult {
  const score = computeScore(resume)
  return {
    score: score.overall,
    band: score.band,
    issues: score.fixes
      .filter((f) => f.state === 'open')
      .map((f) => ({ impact: f.priority, message: f.message })),
  }
}
