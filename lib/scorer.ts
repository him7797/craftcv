import type { Resume, ScoreResult } from './types'

const WEAK_VERB_PREFIXES = [
  'responsible for',
  'helped',
  'worked on',
  'assisted',
  'supported',
  'involved in',
  'participated in',
  'contributed to',
  'was part of',
]

const METRIC_PATTERN = /\d+(%|x|k|m|\+|ms|s\b|hrs?|days?|weeks?|months?|years?|\s*(percent|times|users?|requests?|customers?))/i

function allBullets(resume: Resume): string[] {
  const bullets: string[] = []
  for (const exp of resume.experience) {
    if (exp.bullets) bullets.push(...exp.bullets)
    if (exp.clients) {
      for (const client of exp.clients) bullets.push(...client.bullets)
    }
  }
  return bullets
}

export function scoreResume(resume: Resume): ScoreResult {
  const issues: { impact: 'high' | 'medium' | 'low'; message: string }[] = []
  let score = 100

  const bullets = allBullets(resume)

  // Rule 1: % bullets with metrics
  if (bullets.length > 0) {
    const withMetrics = bullets.filter((b) => METRIC_PATTERN.test(b)).length
    const ratio = withMetrics / bullets.length
    if (ratio < 0.5) {
      const pct = Math.round(ratio * 100)
      score -= 20
      issues.push({
        impact: 'high',
        message: `Only ${pct}% of bullets have quantified metrics — aim for 50%+`,
      })
    }
  } else {
    score -= 15
    issues.push({ impact: 'high', message: 'No experience bullets found' })
  }

  // Rule 2: % bullets starting with weak verbs
  if (bullets.length > 0) {
    const weakCount = bullets.filter((b) =>
      WEAK_VERB_PREFIXES.some((v) => b.toLowerCase().startsWith(v)),
    ).length
    const ratio = weakCount / bullets.length
    if (ratio > 0.2) {
      score -= 15
      issues.push({
        impact: 'high',
        message: `${weakCount} bullet${weakCount > 1 ? 's' : ''} start with weak verbs — use action verbs instead`,
      })
    }
  }

  // Rule 3: Photo present
  if (resume.meta?.hasPhoto) {
    score -= 10
    issues.push({ impact: 'medium', message: 'Remove headshot — ATS systems and US norms exclude photos' })
  }

  // Rule 4: Page count vs experience
  const expYears = resume.experience.length > 0 ? resume.experience.length * 1.5 : 0
  const pages = resume.meta?.pageCount ?? 1
  if (expYears < 10 && pages > 1) {
    score -= 5
    issues.push({ impact: 'medium', message: 'Consider trimming to 1 page — under 10 years experience' })
  }

  // Rule 5: Missing links
  if (!resume.header.links || resume.header.links.length === 0) {
    score -= 5
    issues.push({ impact: 'medium', message: 'Add GitHub/LinkedIn links to your header' })
  }

  // Rule 6: Missing skills section
  if (!resume.skills || resume.skills.length === 0) {
    score -= 10
    issues.push({ impact: 'high', message: 'No skills section detected — add a grouped skills section' })
  }

  score = Math.max(0, Math.min(100, score))

  const band: ScoreResult['band'] =
    score >= 81 ? 'great' : score >= 61 ? 'good' : 'needs-work'

  const sorted = issues.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.impact] - order[b.impact]
  })

  return { score, band, issues: sorted }
}
