import type { Fix, Resume } from '@/lib/types'

export function runTailoring(resume: Resume): { subScore: number; fixes: Fix[] } {
  const fixes: Fix[] = []
  let penalty = 0

  if (!resume.header.links || resume.header.links.length === 0) {
    penalty += 10
    fixes.push({
      id: 'tailoring:no-links',
      axis: 'tailoring',
      state: 'open',
      priority: 'medium',
      message: 'Add GitHub / LinkedIn / portfolio links to your header.',
      target: { kind: 'section', section: 'header' },
    })
  }

  if (!resume.skills || resume.skills.length === 0) {
    penalty += 20
    fixes.push({
      id: 'tailoring:no-skills',
      axis: 'tailoring',
      state: 'open',
      priority: 'high',
      message: 'No skills section — add a grouped list of skills and tech.',
      target: { kind: 'section', section: 'skills' },
    })
  }

  // JD-comparison placeholder: no JD loaded in v1.
  fixes.push({
    id: 'tailoring:no-jd',
    axis: 'tailoring',
    state: 'open',
    priority: 'low',
    message: 'No job description loaded — go to the Tailor tab to score against a JD.',
    target: { kind: 'tab', tab: 'tailor' },
  })

  const subScore = Math.max(0, 100 - penalty)
  return { subScore, fixes }
}
