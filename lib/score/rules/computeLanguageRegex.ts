import type { Resume } from '@/lib/types'
import { runLanguage } from '@/lib/editor/score/rules/language'
import type { RuleOutput, ScoreIssueStub } from '../computeScore'

export function computeLanguageRegex(resume: Resume): RuleOutput {
  const editorResult = runLanguage(resume)
  const score = editorResult.subScore
  const issues: ScoreIssueStub[] = []

  for (const fix of editorResult.fixes) {
    if (fix.id === 'language:too-many-weak') {
      issues.push({
        id: fix.id,
        axis: 'language',
        title: 'Several bullets start with weak verbs',
        state: 'open',
        scoreImpact: 12,
      })
    } else if (fix.id.startsWith('language:weak:')) {
      issues.push({
        id: fix.id,
        axis: 'language',
        title: 'Bullet starts with a weak verb',
        state: 'open',
        excerpt: fix.hint?.slice(0, 80),
        scoreImpact: 4,
      })
    }
  }

  if (score >= 90 && resume.experience.length > 0) {
    issues.push({
      id: 'language:done-active-verbs',
      axis: 'language',
      title: 'Active language throughout',
      state: 'resolved',
      scoreImpact: 0,
    })
  }

  return { axis: 'language', score, issues }
}
