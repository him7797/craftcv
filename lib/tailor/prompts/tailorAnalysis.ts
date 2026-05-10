import type { Resume } from '@/lib/types'

export type ResumeCompact = {
  header: { name: string; location?: string }
  experience: {
    company: string
    role: string
    bulletsFlat: string[]
  }[]
  skillsFlat: string[]
  projectsFlat: { name: string; description: string; tech: string[] }[]
}

export type AnalyseRequest = {
  jdText: string
  activeResume: ResumeCompact
  diff: {
    presentKeywords: string[]
    missingKeywords: string[]
  }
  retryStrict?: boolean
}

export function compactResume(resume: Resume): ResumeCompact {
  return {
    header: {
      name: resume.header.name,
      location: resume.header.location,
    },
    experience: resume.experience.map((exp) => {
      const bullets: string[] = []
      if (exp.bullets) bullets.push(...exp.bullets)
      if (exp.clients) {
        for (const c of exp.clients) bullets.push(...c.bullets)
      }
      return {
        company: exp.company,
        role: exp.role,
        bulletsFlat: bullets,
      }
    }),
    skillsFlat: resume.skills.flatMap((s) => s.items),
    projectsFlat: (resume.projects ?? []).map((p) => ({
      name: p.name,
      description: p.description,
      tech: p.tech ?? [],
    })),
  }
}

export function buildAnalysisPrompt(req: AnalyseRequest): string {
  const lines: string[] = []

  lines.push(
    `You are an expert resume reviewer. Analyse the candidate's resume against the job description below and return a single JSON object.`,
  )
  lines.push('')

  if (req.retryStrict) {
    lines.push(
      `IMPORTANT — STRICT RETRY: Your previous attempt produced invalid JSON or non-verbatim phrases. The ONLY valid output is exact substrings from the provided text. Do not paraphrase. Return JSON only, no preamble, no markdown.`,
    )
    lines.push('')
  }

  lines.push('=== JOB DESCRIPTION ===')
  lines.push(req.jdText.trim())
  lines.push('')

  lines.push('=== CANDIDATE RESUME (compact) ===')
  lines.push(`Name: ${req.activeResume.header.name}`)
  if (req.activeResume.header.location) {
    lines.push(`Location: ${req.activeResume.header.location}`)
  }
  lines.push('')
  lines.push('Experience:')
  for (const exp of req.activeResume.experience) {
    lines.push(`- ${exp.role} at ${exp.company}`)
    for (const b of exp.bulletsFlat) lines.push(`  • ${b}`)
  }
  if (req.activeResume.skillsFlat.length > 0) {
    lines.push('')
    lines.push(`Skills: ${req.activeResume.skillsFlat.join(', ')}`)
  }
  if (req.activeResume.projectsFlat.length > 0) {
    lines.push('')
    lines.push('Projects:')
    for (const p of req.activeResume.projectsFlat) {
      lines.push(`- ${p.name}: ${p.description}`)
      if (p.tech.length > 0) lines.push(`  tech: ${p.tech.join(', ')}`)
    }
  }
  lines.push('')

  lines.push('=== KEYWORD DIFF (already computed deterministically — do NOT recompute) ===')
  lines.push(
    `Present in resume: ${req.diff.presentKeywords.length > 0 ? req.diff.presentKeywords.join(', ') : '(none)'}`,
  )
  lines.push(
    `Missing from resume: ${req.diff.missingKeywords.length > 0 ? req.diff.missingKeywords.join(', ') : '(none)'}`,
  )
  lines.push('')

  lines.push('=== TASK ===')
  lines.push('Return EXACTLY this JSON shape, no preamble, no markdown fences:')
  lines.push('{')
  lines.push('  "matchScore": <0..100 integer>,')
  lines.push('  "subscores": {')
  lines.push('    "technologies": <0..100 integer>,')
  lines.push('    "languageMirror": <0..100 integer>,')
  lines.push('    "domainTerms": <0..100 integer>')
  lines.push('  },')
  lines.push('  "languageSuggestions": [')
  lines.push('    { "resumeSays": "<verbatim substring of resume>", "jdLanguage": "<verbatim substring of JD>", "rationale": "<≤12 words, optional>" }')
  lines.push('  ]')
  lines.push('}')
  lines.push('')
  lines.push('Rules:')
  lines.push(
    '- matchScore = round(0.40 * technologies + 0.35 * languageMirror + 0.25 * domainTerms).',
  )
  lines.push('- Sub-scores 0..100. Use the keyword-diff above to inform "technologies".')
  lines.push(
    '- "languageMirror" measures how closely the resume\'s wording mirrors the JD\'s phrasing.',
  )
  lines.push(
    '- "domainTerms" measures domain-specific jargon match (e.g. "at scale", "concurrent users", "feature flags").',
  )
  lines.push('- Return 3..5 languageSuggestions, prioritized by impact.')
  lines.push(
    '- "resumeSays" MUST be a verbatim substring of the candidate resume above (any bullet, project, or skill).',
  )
  lines.push('- "jdLanguage" MUST be a verbatim substring of the JOB DESCRIPTION above.')
  lines.push('- "rationale" is OPTIONAL and ≤ 12 words. Omit when nothing useful to add.')
  lines.push('- DO NOT include keywords, smartCatches, analysedAt, or modelUsed — those are merged client-side.')
  lines.push('- DO NOT wrap in markdown. Just the JSON object.')

  return lines.join('\n')
}
