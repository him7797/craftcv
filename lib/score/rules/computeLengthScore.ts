import type { Resume } from '@/lib/types'
import type { RuleOutput, ScoreIssueStub } from '../computeScore'

/**
 * Estimate years of experience from the earliest experience.startDate.
 * Returns 0 when no experience entries exist.
 */
function estimateYearsOfExperience(resume: Resume): number {
  if (resume.experience.length === 0) return 0
  let earliest = Infinity
  for (const exp of resume.experience) {
    const year = parseStartYear(exp.startDate)
    if (year !== null && year < earliest) earliest = year
  }
  if (!Number.isFinite(earliest)) return 0
  const now = new Date().getFullYear()
  return Math.max(0, now - earliest)
}

function parseStartYear(s: string): number | null {
  // Accepts "Dec 2022", "2022-01", "2022", "Jan 2018 - Present" etc.
  const match = s.match(/(19|20)\d{2}/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Length sub-score:
 *   <3 yrs experience → ideal 1 page
 *   3–10 yrs → ideal up to 2 pages
 *   10+ yrs → up to 3 pages OK
 *
 * Page count comes from resume.meta.pageCount (set by the parser); when missing,
 * we assume a healthy 1 page and skip flagging.
 */
export function computeLengthScore(resume: Resume): RuleOutput {
  const issues: ScoreIssueStub[] = []
  const years = estimateYearsOfExperience(resume)
  const pages = resume.meta?.pageCount ?? 1

  let idealMaxPages: number
  if (years < 3) idealMaxPages = 1
  else if (years < 10) idealMaxPages = 2
  else idealMaxPages = 3

  let score: number
  if (pages <= idealMaxPages) {
    score = 100
  } else if (pages === idealMaxPages + 1) {
    score = 70
    issues.push({
      id: 'length:over-by-one',
      axis: 'length',
      title: `Resume is ${pages} pages — aim for ${idealMaxPages}`,
      state: 'open',
      scoreImpact: 6,
    })
  } else {
    score = 40
    issues.push({
      id: 'length:over-by-many',
      axis: 'length',
      title: `Resume is ${pages} pages — significantly over the ${idealMaxPages}-page ideal for ${years} years experience`,
      state: 'open',
      scoreImpact: 9,
    })
  }

  if (score === 100 && resume.experience.length > 0) {
    issues.push({
      id: 'length:done-appropriate',
      axis: 'length',
      title: `Length appropriate for ${years} years experience`,
      state: 'resolved',
      scoreImpact: 0,
    })
  }

  return { axis: 'length', score, issues }
}
