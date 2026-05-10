import type { ScoreBand } from '@/lib/types'
import type { ScoreIssueStub, SubScoresPre } from '../computeScore'
import type { ResumeCompact } from '@/lib/tailor/prompts/tailorAnalysis'

export type ScoreRefineRequest = {
  resumeCompact: ResumeCompact
  subscoresPre: SubScoresPre
  issues: ScoreIssueStub[]
  band: ScoreBand
  retryStrict?: boolean
}

export function buildRefinePrompt(req: ScoreRefineRequest): string {
  const lines: string[] = []

  lines.push(
    `You are an expert resume reviewer. Your task is to refine a Language sub-score and produce natural-language explanations for a resume diagnostic dashboard.`,
  )
  lines.push('')

  if (req.retryStrict) {
    lines.push(
      `IMPORTANT — STRICT RETRY: Your previous response was not valid JSON or did not match the required schema. Return ONLY the JSON object below, no preamble, no markdown, no commentary.`,
    )
    lines.push('')
  }

  lines.push('=== CANDIDATE RESUME (compact) ===')
  lines.push(`Name: ${req.resumeCompact.header.name}`)
  if (req.resumeCompact.header.location) {
    lines.push(`Location: ${req.resumeCompact.header.location}`)
  }
  lines.push('')
  lines.push('Experience:')
  for (const exp of req.resumeCompact.experience) {
    lines.push(`- ${exp.role} at ${exp.company}`)
    for (const b of exp.bulletsFlat) lines.push(`  • ${b}`)
  }
  if (req.resumeCompact.skillsFlat.length > 0) {
    lines.push('')
    lines.push(`Skills: ${req.resumeCompact.skillsFlat.join(', ')}`)
  }
  if (req.resumeCompact.projectsFlat.length > 0) {
    lines.push('')
    lines.push('Projects:')
    for (const p of req.resumeCompact.projectsFlat) {
      lines.push(`- ${p.name}: ${p.description}`)
    }
  }
  lines.push('')

  lines.push('=== DETERMINISTIC PRE-PASS ===')
  lines.push(
    `Subscores: impact=${req.subscoresPre.impact}, language=${req.subscoresPre.language}, tailoring=${req.subscoresPre.tailoring}, format=${req.subscoresPre.format}, length=${req.subscoresPre.length}`,
  )
  lines.push(`Band: ${req.band}`)
  lines.push('')
  lines.push('Issues found by deterministic rules:')
  for (const iss of req.issues) {
    lines.push(`- [${iss.id}] (${iss.axis}, ${iss.state}) ${iss.title}${iss.excerpt ? ` — "${iss.excerpt}"` : ''}`)
  }
  lines.push('')

  lines.push('=== TASK ===')
  lines.push('Return EXACTLY this JSON shape, no preamble, no markdown fences:')
  lines.push('{')
  lines.push('  "languageDelta": <integer in [-10, +10]>,')
  lines.push('  "verdictText": "<2-3 sentences, recruiter tone, calibrated to band>",')
  lines.push('  "explanations": {')
  lines.push('    "<issueId>": "<1-2 sentences explaining the issue and the fix>",')
  lines.push('    ... one entry per issue id above ...')
  lines.push('  }')
  lines.push('}')
  lines.push('')
  lines.push('Rules:')
  lines.push(
    `- languageDelta: refine the deterministic Language sub-score by ±10 points based on subtle cliches, mild passive voice, or tone issues that regex can't catch. Use a negative delta when you find issues; positive when the writing is unusually strong.`,
  )
  lines.push(
    '- verdictText: 2-3 sentences. Tone matches the band: GREAT = confident, GOOD = "small gaps", OK = "meaningful work to do", NEEDS WORK = direct.',
  )
  lines.push(
    '- explanations: one entry per issue id. 1-2 sentences each. Name specific bullets/sections. Quantify the score-impact when natural ("would push 85 → 95"). Suggest the fix in plain language.',
  )
  lines.push('- Output JSON only. Do not paraphrase the schema. Do not include extra fields.')

  return lines.join('\n')
}
