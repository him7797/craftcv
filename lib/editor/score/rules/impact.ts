import type { Fix, Resume } from '@/lib/types'
import { iterateBullets, plainText } from '../iterateBullets'

const METRIC_PATTERN =
  /\d+(%|x|k|m|\+|ms|s\b|hrs?|days?|weeks?|months?|years?|\s*(percent|times|users?|requests?|customers?))/i

export function runImpact(resume: Resume): { subScore: number; fixes: Fix[] } {
  const bullets = iterateBullets(resume)
  const fixes: Fix[] = []

  if (bullets.length === 0) {
    fixes.push({
      id: 'impact:no-bullets',
      axis: 'impact',
      state: 'open',
      priority: 'high',
      message: 'No experience bullets yet — add a few to start scoring.',
      target: { kind: 'section', section: 'experience' },
    })
    return { subScore: 0, fixes }
  }

  let withMetrics = 0
  for (const { path, text } of bullets) {
    if (METRIC_PATTERN.test(plainText(text))) {
      withMetrics++
    } else {
      fixes.push({
        id: `impact:no-metric:${pathId(path)}`,
        axis: 'impact',
        state: 'open',
        priority: 'medium',
        message: 'Bullet has no metric — quantify the impact.',
        hint: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
        target: { kind: 'bullet', path },
      })
    }
  }

  const coverage = withMetrics / bullets.length
  const subScore = Math.round(coverage * 100)

  if (coverage < 0.5) {
    fixes.unshift({
      id: 'impact:low-coverage',
      axis: 'impact',
      state: 'open',
      priority: 'high',
      message: `Only ${Math.round(coverage * 100)}% of bullets have a metric — aim for 50%+.`,
      target: { kind: 'section', section: 'experience' },
    })
  }

  return { subScore, fixes }
}

function pathId(p: { section: string } & Record<string, unknown>): string {
  if (p.section === 'experience') {
    return `e-${p.expIndex}-${p.clientIndex ?? 'top'}-${p.bulletIndex}`
  }
  return `p-${p.projectIndex}-${p.bulletIndex}`
}
