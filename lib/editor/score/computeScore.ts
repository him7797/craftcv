import type { Fix, Resume, Score } from '@/lib/types'
import { runFormat } from './rules/format'
import { runImpact } from './rules/impact'
import { runLanguage } from './rules/language'
import { runTailoring } from './rules/tailoring'

const WEIGHTS = { impact: 0.4, language: 0.25, tailoring: 0.2, format: 0.15 }

const PRIORITY_ORDER: Record<Fix['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function computeScore(resume: Resume): Score {
  const impact = runImpact(resume)
  const language = runLanguage(resume)
  const tailoring = runTailoring(resume)
  const format = runFormat(resume)

  const overall = Math.round(
    WEIGHTS.impact * impact.subScore +
      WEIGHTS.language * language.subScore +
      WEIGHTS.tailoring * tailoring.subScore +
      WEIGHTS.format * format.subScore,
  )

  const band: Score['band'] =
    overall >= 81 ? 'great' : overall >= 61 ? 'good' : 'needs-work'

  const allFixes = [...impact.fixes, ...language.fixes, ...tailoring.fixes, ...format.fixes]

  const sorted = allFixes.sort((a, b) => {
    if (a.state !== b.state) return a.state === 'open' ? -1 : 1
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  })

  return {
    overall,
    band,
    subScores: {
      impact: impact.subScore,
      language: language.subScore,
      tailoring: tailoring.subScore,
      format: format.subScore,
    },
    fixes: sorted,
  }
}
