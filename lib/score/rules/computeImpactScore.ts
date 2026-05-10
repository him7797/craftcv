import type { Resume } from '@/lib/types'
import { runImpact } from '@/lib/editor/score/rules/impact'
import type { RuleOutput, ScoreIssueStub } from '../computeScore'
import { iterateBullets } from '@/lib/editor/score/iterateBullets'

export function computeImpactScore(resume: Resume): RuleOutput {
  const editorResult = runImpact(resume)
  const score = editorResult.subScore
  const issues: ScoreIssueStub[] = []

  const totalBullets = iterateBullets(resume).length

  for (const fix of editorResult.fixes) {
    if (fix.id.startsWith('impact:no-metric:')) {
      issues.push({
        id: fix.id,
        axis: 'impact',
        title: 'Bullet missing a metric',
        state: 'open',
        excerpt: fix.hint?.slice(0, 80),
        scoreImpact: perBulletImpact(totalBullets),
      })
    } else if (fix.id === 'impact:no-bullets') {
      issues.push({
        id: fix.id,
        axis: 'impact',
        title: 'Add at least one experience bullet',
        state: 'open',
        scoreImpact: 30,
      })
    } else if (fix.id === 'impact:low-coverage') {
      issues.push({
        id: fix.id,
        axis: 'impact',
        title: 'Several bullets missing metrics',
        state: 'open',
        scoreImpact: 18,
      })
    }
  }

  // DONE marker when score is excellent
  if (score >= 95 && totalBullets > 0) {
    issues.push({
      id: 'impact:done-major-metrics',
      axis: 'impact',
      title: 'Major metrics present',
      state: 'resolved',
      scoreImpact: 0,
    })
  }

  return { axis: 'impact', score, issues }
}

function perBulletImpact(totalBullets: number): number {
  if (totalBullets === 0) return 0
  // Closing one bullet's metric gap raises Impact sub-score by 100/totalBullets points;
  // overall by ~30% of that (impact weight).
  const overallGain = (0.3 * 100) / totalBullets
  return Math.round(Math.min(15, overallGain))
}
