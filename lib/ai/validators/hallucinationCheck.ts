import type { BlockContent, Resume } from '@/lib/types'

export function extractTerms(text: string): Set<string> {
  const terms = new Set<string>()

  // Numbers with units: 40%, 12K, 1M, 500ms, $2M, etc.
  const metrics = text.match(/\$?\d+[\d,.]*[KkMmBb%]?(?:ms|s|min|hrs?|days?|K|M|B|GB|MB)?/g) ?? []
  for (const m of metrics) terms.add(m)

  // CamelCase tech names: TypeScript, PostgreSQL, GraphQL, etc.
  const camel = text.match(/[A-Z][a-z]+(?:[A-Z][a-z]+)+/g) ?? []
  for (const c of camel) terms.add(c)

  // ALL-CAPS acronyms 2–8 chars: AWS, REST, SQL, CI/CD, etc.
  const acronyms = text.match(/\b[A-Z]{2,8}\b/g) ?? []
  for (const a of acronyms) terms.add(a)

  // Capitalized proper nouns (2+ chars, not sentence starts): product/company names
  const proper = text.match(/(?<![.!?]\s)[A-Z][a-z]{2,}/g) ?? []
  for (const p of proper) terms.add(p)

  return terms
}

function blockContentToText(content: BlockContent): string {
  switch (content.blockType) {
    case 'experience-description':
      return content.text
    case 'experience-bullets':
      return content.bullets.join(' ')
    case 'project-block':
      return [content.name, content.description, ...content.tech, ...content.bullets].join(' ')
    case 'skills-section':
      return content.categories.flatMap((c) => [c.category, ...c.items]).join(' ')
  }
}

function resumeToText(resume: Resume): string {
  const parts: string[] = []
  parts.push(resume.header.name)
  for (const exp of resume.experience) {
    parts.push(exp.company, exp.role, exp.description ?? '')
    parts.push(...(exp.bullets ?? []))
    for (const client of exp.clients ?? []) {
      parts.push(client.name, ...(client.tech ?? []), ...client.bullets)
    }
  }
  for (const skill of resume.skills) {
    parts.push(skill.category, ...skill.items)
  }
  for (const proj of resume.projects ?? []) {
    parts.push(proj.name, proj.description, ...(proj.tech ?? []), ...(proj.bullets ?? []))
  }
  return parts.join(' ')
}

export function checkHallucination(
  after: BlockContent,
  before: BlockContent,
  masterResume: Resume,
): string | null {
  const afterText = blockContentToText(after)
  const allowedText = blockContentToText(before) + ' ' + resumeToText(masterResume)

  const afterTerms = extractTerms(afterText)
  const allowedTerms = extractTerms(allowedText)

  for (const term of afterTerms) {
    // Allow short terms (single digits, common words) — focus on names/metrics
    if (term.length < 3) continue
    if (!allowedTerms.has(term)) return term
  }
  return null
}
