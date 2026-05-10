import type { Resume } from '@/lib/types'
import { runFormat } from '@/lib/editor/score/rules/format'
import type { RuleOutput, ScoreIssueStub } from '../computeScore'

export function computeFormatScore(resume: Resume): RuleOutput {
  const editorResult = runFormat(resume)
  const score = editorResult.subScore
  const issues: ScoreIssueStub[] = []

  for (const fix of editorResult.fixes) {
    if (fix.id === 'format:photo') {
      issues.push({
        id: fix.id,
        axis: 'format',
        title: 'Photo detected — remove for ATS friendliness',
        state: 'open',
        scoreImpact: 10,
      })
    } else if (fix.id === 'format:multi-column') {
      issues.push({
        id: fix.id,
        axis: 'format',
        title: 'Multi-column layout',
        state: 'open',
        scoreImpact: 8,
      })
    } else if (fix.id === 'format:too-long') {
      issues.push({
        id: fix.id,
        axis: 'format',
        title: 'Resume length may be too long',
        state: 'open',
        scoreImpact: 5,
      })
    }
  }

  if (score === 100) {
    issues.push({
      id: 'format:done-single-column',
      axis: 'format',
      title: 'Single column layout',
      state: 'resolved',
      scoreImpact: 0,
    })
    issues.push({
      id: 'format:done-no-photos',
      axis: 'format',
      title: 'No photos, skill bars, or self-ratings',
      state: 'resolved',
      scoreImpact: 0,
    })
  }

  return { axis: 'format', score, issues }
}
