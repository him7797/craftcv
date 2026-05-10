import type { Resume, Version } from '@/lib/types'

export function flattenResumeText(resume: Resume): string {
  const parts: string[] = []

  parts.push(resume.header.name)
  if (resume.header.location) parts.push(resume.header.location)
  if (resume.header.email) parts.push(resume.header.email)
  if (resume.header.links) {
    for (const l of resume.header.links) {
      parts.push(l.label, l.url)
    }
  }

  for (const exp of resume.experience) {
    parts.push(exp.company, exp.role, exp.startDate, exp.endDate)
    if (exp.bullets) parts.push(...exp.bullets)
    if (exp.clients) {
      for (const c of exp.clients) {
        parts.push(c.name, c.startDate, c.endDate)
        if (c.tech) parts.push(...c.tech)
        parts.push(...c.bullets)
      }
    }
  }

  for (const s of resume.skills) {
    parts.push(s.category, ...s.items)
  }

  for (const e of resume.education) {
    parts.push(e.institution, e.degree, e.startYear, e.endYear)
  }

  if (resume.projects) {
    for (const p of resume.projects) {
      parts.push(p.name, p.description)
      if (p.tech) parts.push(...p.tech)
      if (p.link) parts.push(p.link)
    }
  }

  return parts.filter(Boolean).join(' ')
}

export type SectionBlock = {
  sectionLabel: string
  text: string
}

export function flattenAllSections(resume: Resume): SectionBlock[] {
  const blocks: SectionBlock[] = []

  for (const exp of resume.experience) {
    const expHeader = `${exp.role} at ${exp.company}`
    if (exp.bullets && exp.bullets.length > 0) {
      blocks.push({ sectionLabel: expHeader, text: exp.bullets.join(' ') })
    }
    if (exp.clients) {
      for (const c of exp.clients) {
        const techText = c.tech ? c.tech.join(' ') : ''
        blocks.push({
          sectionLabel: `${expHeader} — ${c.name}`,
          text: `${techText} ${c.bullets.join(' ')}`.trim(),
        })
      }
    }
  }

  for (const s of resume.skills) {
    blocks.push({ sectionLabel: `Skills — ${s.category}`, text: s.items.join(' ') })
  }

  if (resume.projects) {
    for (const p of resume.projects) {
      const techText = p.tech ? p.tech.join(' ') : ''
      blocks.push({
        sectionLabel: `${p.name} project`,
        text: `${p.description} ${techText}`.trim(),
      })
    }
  }

  return blocks
}

export function flattenVersion(version: Version): string {
  return flattenResumeText(version.resume)
}
