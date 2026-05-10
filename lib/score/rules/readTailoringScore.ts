import type { RuleOutput, ScoreIssueStub } from '../computeScore'
import { useTailorStore } from '@/lib/store/useTailorStore'

const DEFAULT_NO_JD_SCORE = 50

/**
 * Read the tailoring sub-score from the active Tailor profile, if any.
 * The Score screen does not own tailoring — it just consumes the latest
 * Tailor result for the active resume version.
 *
 * When no profile is active or it has no analysis yet, return 50 with an
 * open issue inviting the user to load a JD.
 */
export function readTailoringScore(): RuleOutput {
  const tailor = useTailorStore.getState()
  const activeProfile = tailor.activeProfileId
    ? tailor.profiles.find((p) => p.id === tailor.activeProfileId) ?? null
    : null
  const lastAnalysis = activeProfile?.lastAnalysis ?? tailor.result

  const issues: ScoreIssueStub[] = []

  if (!lastAnalysis) {
    issues.push({
      id: 'tailoring:no-jd-loaded',
      axis: 'tailoring',
      title: 'No JD loaded for tailoring',
      state: 'open',
      scoreImpact: 12,
    })
    return { axis: 'tailoring', score: DEFAULT_NO_JD_SCORE, issues }
  }

  const score = lastAnalysis.matchScore
  const missingCount = lastAnalysis.keywords.missing.length
  if (missingCount > 0) {
    issues.push({
      id: 'tailoring:missing-keywords',
      axis: 'tailoring',
      title: `${missingCount} keyword${missingCount === 1 ? '' : 's'} missing from this resume`,
      state: 'open',
      scoreImpact: Math.min(15, missingCount * 2),
    })
  }

  if (score >= 90 && missingCount === 0) {
    issues.push({
      id: 'tailoring:done-strong-match',
      axis: 'tailoring',
      title: 'Strong match against the active JD',
      state: 'resolved',
      scoreImpact: 0,
    })
  }

  return { axis: 'tailoring', score, issues }
}
