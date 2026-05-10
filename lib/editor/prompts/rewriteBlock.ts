import { readFileSync } from 'fs'
import { join } from 'path'
import type { BlockContent, BlockType, RetryHint } from '@/lib/types'

export type RewriteBlockRequest = {
  blockType: BlockType
  blockContent: BlockContent
  resumeContext: {
    name: string
    role: string
    totalYears: number
    otherJobs: string[]
    otherTechMentioned: string[]
  }
  jdContext?: {
    jdText: string
    missingKeywords: string[]
    matchScore: number
  }
  retryHint?: RetryHint
}

function loadContext(relativePath: string): string {
  try {
    return readFileSync(join(process.cwd(), 'lib/ai/contexts', relativePath), 'utf-8')
  } catch {
    return ''
  }
}

const BLOCK_CONTEXT_FILES: Record<BlockType, string> = {
  'experience-description': 'blocks/experienceDescription.md',
  'project-block': 'blocks/projectBlock.md',
  'experience-bullets': 'blocks/experienceBullets.md',
  'skills-section': 'blocks/skillsSection.md',
}

const RETRY_HINTS: Record<RetryHint, string> = {
  'different-angle': 'The previous suggestion was rejected. Try a completely different angle — reframe the contribution differently.',
  'shorter': 'The previous suggestion was rejected. Make it shorter and more concise.',
  'more-metrics': 'The previous suggestion was rejected. Add more concrete metrics and quantified outcomes.',
  'less-jargon': 'The previous suggestion was rejected. Use simpler, less technical language that any recruiter can understand.',
  'simpler-language': 'The previous suggestion was rejected. Use plain, direct language. Avoid buzzwords entirely.',
}

function blockContentToString(content: BlockContent): string {
  switch (content.blockType) {
    case 'experience-description':
      return content.text || '(empty — no description written yet)'
    case 'experience-bullets':
      return content.bullets.length > 0
        ? content.bullets.map((b) => `- ${b}`).join('\n')
        : '(no bullets yet)'
    case 'project-block':
      return [
        `Name: ${content.name}`,
        `Description: ${content.description}`,
        `Tech: ${content.tech.join(', ')}`,
        content.bullets.length > 0 ? content.bullets.map((b) => `- ${b}`).join('\n') : '',
        content.link ? `Link: ${content.link}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    case 'skills-section':
      return content.categories
        .map((c) => `${c.category}: ${c.items.join(', ')}`)
        .join('\n')
  }
}

const OUTPUT_SCHEMAS: Record<BlockType, string> = {
  'experience-description': `{
  "blockType": "experience-description",
  "before": { "blockType": "experience-description", "text": "<original text>" },
  "after": { "blockType": "experience-description", "text": "<rewritten text>" },
  "diff": { "added": ["..."], "removed": ["..."], "modified": [{ "from": "...", "to": "..." }] },
  "rationale": "<one sentence explaining the key improvement>",
  "guidelinesApplied": ["<e.g. added-scope>", "<e.g. added-scale>", "<e.g. removed:responsible-for>"]
}`,
  'experience-bullets': `{
  "blockType": "experience-bullets",
  "before": { "blockType": "experience-bullets", "bullets": ["<original bullets>"] },
  "after": { "blockType": "experience-bullets", "bullets": ["<rewritten bullets>"] },
  "diff": { "added": ["..."], "removed": ["..."], "modified": [{ "from": "...", "to": "..." }] },
  "rationale": "<one sentence explaining the key improvement>",
  "guidelinesApplied": ["<e.g. impact-framework>", "<e.g. removed:responsible-for>", "<e.g. active-verbs>"]
}`,
  'project-block': `{
  "blockType": "project-block",
  "before": { "blockType": "project-block", "name": "...", "description": "...", "tech": [], "bullets": [] },
  "after": { "blockType": "project-block", "name": "...", "description": "...", "tech": [], "bullets": [], "link": "..." },
  "diff": { "added": ["..."], "removed": ["..."], "modified": [{ "from": "...", "to": "..." }] },
  "rationale": "<one sentence explaining the key improvement>",
  "guidelinesApplied": ["<e.g. user-value-description>", "<e.g. curated-tech-list>", "<e.g. impact-bullets>"]
}`,
  'skills-section': `{
  "blockType": "skills-section",
  "before": { "blockType": "skills-section", "categories": [{ "category": "...", "items": [] }] },
  "after": { "blockType": "skills-section", "categories": [{ "category": "...", "items": [] }] },
  "diff": { "added": ["..."], "removed": ["..."], "modified": [] },
  "rationale": "<one sentence explaining the key improvement>",
  "guidelinesApplied": ["<e.g. canonical-categories>", "<e.g. removed-filler>", "<e.g. deduplicated>"]
}`,
}

export function buildRewriteBlockPrompt(req: RewriteBlockRequest): string {
  const { blockType, blockContent, resumeContext, jdContext, retryHint } = req

  const resumeGuide = loadContext('resumeGuide.md')
  const blockContext = loadContext(BLOCK_CONTEXT_FILES[blockType])

  const jdBlock = jdContext && jdContext.jdText.length >= 200
    ? `## JD CONTEXT
This resume is being tailored for the following job description. Mirror its domain language without keyword-stuffing. Missing keywords from Tailor analysis: ${jdContext.missingKeywords.join(', ') || 'none'}.
Match score so far: ${jdContext.matchScore}%.

JOB DESCRIPTION:
${jdContext.jdText.slice(0, 3000)}
`
    : ''

  const resumeCtxBlock = `## RESUME CONTEXT
Person: ${resumeContext.name}
Current role: ${resumeContext.role}
Total years experience: ${resumeContext.totalYears}
Other roles on resume: ${resumeContext.otherJobs.join(', ') || 'none'}
Technologies already mentioned elsewhere in resume: ${resumeContext.otherTechMentioned.join(', ') || 'none'}
Do not duplicate language used in other blocks.`

  const currentBlock = `## CURRENT BLOCK CONTENT (the source to rewrite)
${blockContentToString(blockContent)}`

  const outputFormat = `## OUTPUT FORMAT INSTRUCTIONS
Output ONLY the following JSON object. No preamble. No explanation. No markdown fences. No "Here is...".
The JSON must be complete and valid.

${OUTPUT_SCHEMAS[blockType]}`

  const retryBlock = retryHint ? `## RETRY INSTRUCTION\n${RETRY_HINTS[retryHint]}` : ''

  return [
    resumeGuide,
    '---',
    blockContext,
    jdBlock,
    resumeCtxBlock,
    currentBlock,
    outputFormat,
    retryBlock,
  ]
    .filter(Boolean)
    .join('\n\n')
}
