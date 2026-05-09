import type { Fix, Resume } from '@/lib/types'

export function runFormat(resume: Resume): { subScore: number; fixes: Fix[] } {
  const fixes: Fix[] = []
  let penalty = 0

  if (resume.meta?.hasPhoto) {
    penalty += 25
    fixes.push({
      id: 'format:photo',
      axis: 'format',
      state: 'open',
      priority: 'high',
      message: 'Remove the headshot — most ATS systems and US/UK norms exclude photos.',
      target: { kind: 'section', section: 'header' },
    })
  }

  const expCount = resume.experience.length
  const pages = resume.meta?.pageCount ?? 1
  if (expCount > 0 && expCount < 7 && pages > 1) {
    penalty += 15
    fixes.push({
      id: 'format:too-long',
      axis: 'format',
      state: 'open',
      priority: 'medium',
      message: `${pages} pages may be long — under ~10 yrs of experience usually fits 1 page.`,
      target: { kind: 'section', section: 'experience' },
    })
  }

  if (resume.meta?.isMultiColumn) {
    penalty += 10
    fixes.push({
      id: 'format:multi-column',
      axis: 'format',
      state: 'open',
      priority: 'low',
      message: 'Multi-column layout — some ATS parsers may scramble the order.',
    })
  }

  const subScore = Math.max(0, 100 - penalty)
  return { subScore, fixes }
}
