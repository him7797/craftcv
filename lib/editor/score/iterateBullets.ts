import type { BulletPath, Resume } from '@/lib/types'

export type BulletWithPath = { path: BulletPath; text: string }

export function iterateBullets(resume: Resume): BulletWithPath[] {
  const out: BulletWithPath[] = []
  resume.experience.forEach((exp, expIndex) => {
    if (exp.clients) {
      exp.clients.forEach((client, clientIndex) => {
        client.bullets.forEach((text, bulletIndex) => {
          out.push({
            path: { section: 'experience', expIndex, clientIndex, bulletIndex },
            text,
          })
        })
      })
    }
    if (exp.bullets) {
      exp.bullets.forEach((text, bulletIndex) => {
        out.push({
          path: { section: 'experience', expIndex, clientIndex: null, bulletIndex },
          text,
        })
      })
    }
  })
  return out
}

export function plainText(source: string): string {
  return source.replace(/\{\{[mti]:((?:[^}]|\}(?!\}))*)\}\}/g, '$1')
}
