import type { Fix, Resume } from '@/lib/types'
import { iterateBullets, plainText } from '../iterateBullets'

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

export function runLanguage(resume: Resume): { subScore: number; fixes: Fix[] } {
  const bullets = iterateBullets(resume)
  const fixes: Fix[] = []

  if (bullets.length === 0) {
    return { subScore: 100, fixes: [] }
  }

  let weakCount = 0
  for (const { path, text } of bullets) {
    const lower = plainText(text).toLowerCase().trimStart()
    const matched = WEAK_VERB_PREFIXES.find((p) => lower.startsWith(p))
    if (matched) {
      weakCount++
      fixes.push({
        id: `language:weak:${pathId(path)}`,
        axis: 'language',
        state: 'open',
        priority: 'medium',
        message: `Starts with "${matched}" — use a strong action verb instead.`,
        hint: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
        target: { kind: 'bullet', path },
      })
    }
  }

  const ratio = weakCount / bullets.length
  const subScore = Math.max(0, Math.round((1 - ratio) * 100))

  if (ratio > 0.2) {
    fixes.unshift({
      id: 'language:too-many-weak',
      axis: 'language',
      state: 'open',
      priority: 'high',
      message: `${weakCount} bullet${weakCount > 1 ? 's' : ''} start with weak verbs.`,
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
