import type { AiSessionTarget, BulletPath, ParentPath } from '@/lib/types'

export function isPathMatch(
  target: AiSessionTarget | null | undefined,
  path: BulletPath,
): boolean {
  if (!target) return false
  if ('section' in target && target.section === 'new-bullet') return false
  const t = target as BulletPath
  if (t.section !== path.section) return false
  if (t.section === 'experience' && path.section === 'experience') {
    return (
      t.expIndex === path.expIndex &&
      t.clientIndex === path.clientIndex &&
      t.bulletIndex === path.bulletIndex
    )
  }
  if (t.section === 'projects' && path.section === 'projects') {
    return t.projectIndex === path.projectIndex && t.bulletIndex === path.bulletIndex
  }
  return false
}

export function isParentMatch(
  target: AiSessionTarget | null | undefined,
  parent: ParentPath,
): boolean {
  if (!target) return false
  if (!('section' in target) || target.section !== 'new-bullet') return false
  const p = target.parent
  if (p.section !== parent.section) return false
  if (p.section === 'experience' && parent.section === 'experience') {
    return p.expIndex === parent.expIndex && p.clientIndex === parent.clientIndex
  }
  if (p.section === 'projects' && parent.section === 'projects') {
    return p.projectIndex === parent.projectIndex
  }
  return false
}
