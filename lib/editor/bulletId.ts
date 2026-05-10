import type { BulletPath } from '@/lib/types'

export function hashBulletPath(p: BulletPath): string {
  if (p.section === 'experience') {
    return `e-${p.expIndex}-${p.clientIndex ?? 'top'}-${p.bulletIndex}`
  }
  return `p-${p.projectIndex}-${p.bulletIndex}`
}

export function bulletElementId(p: BulletPath): string {
  return `bullet-${hashBulletPath(p)}`
}
