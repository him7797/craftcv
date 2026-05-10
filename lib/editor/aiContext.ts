import type { AiSessionTarget, BulletPath, ParentPath, Resume } from '@/lib/types'

type Ctx = {
  role?: string
  company?: string
  tech?: string[]
  siblingBullets?: string[]
}

export function buildContextForTarget(resume: Resume, target: AiSessionTarget): Ctx {
  if ('section' in target && target.section === 'new-bullet') {
    return contextForParent(resume, target.parent)
  }
  return contextForBulletPath(resume, target as BulletPath)
}

function contextForParent(resume: Resume, parent: ParentPath): Ctx {
  if (parent.section === 'experience') {
    const exp = resume.experience[parent.expIndex]
    if (!exp) return {}
    if (parent.clientIndex !== null) {
      const client = exp.clients?.[parent.clientIndex]
      return {
        role: exp.role,
        company: `${exp.company} — ${client?.name ?? ''}`,
        tech: client?.tech,
        siblingBullets: (client?.bullets ?? []).slice(-3),
      }
    }
    return {
      role: exp.role,
      company: exp.company,
      siblingBullets: (exp.bullets ?? []).slice(-3),
    }
  }
  const proj = resume.projects?.[parent.projectIndex]
  if (!proj) return {}
  return { role: 'Project', company: proj.name, tech: proj.tech }
}

function contextForBulletPath(resume: Resume, path: BulletPath): Ctx {
  if (path.section === 'experience') {
    const exp = resume.experience[path.expIndex]
    if (!exp) return {}
    if (path.clientIndex !== null) {
      const client = exp.clients?.[path.clientIndex]
      return {
        role: exp.role,
        company: `${exp.company} — ${client?.name ?? ''}`,
        tech: client?.tech,
        siblingBullets: nearby(client?.bullets ?? [], path.bulletIndex),
      }
    }
    return {
      role: exp.role,
      company: exp.company,
      siblingBullets: nearby(exp.bullets ?? [], path.bulletIndex),
    }
  }
  const proj = resume.projects?.[path.projectIndex]
  if (!proj) return {}
  return { role: 'Project', company: proj.name, tech: proj.tech }
}

function nearby(bullets: string[], idx: number): string[] {
  const out: string[] = []
  for (let i = Math.max(0, idx - 2); i < bullets.length && out.length < 3; i++) {
    if (i === idx) continue
    out.push(bullets[i])
  }
  return out
}
