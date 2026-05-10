import type {
  ScoreActionItem,
  ScoreActionItemPriority,
  ScoreActionItemTarget,
  ScoreAxis,
  ScoreBand,
  DashboardScoreResult,
  ScoreSubScore,
} from '@/lib/types'
import { computeOverall, type ComputeScoreResult, type ScoreIssueStub } from './computeScore'
import type { ScoreRefineResponseBody } from './refineWithAi'

const PRIORITY_ORDER: Record<ScoreActionItemPriority, number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  DONE: 3,
}

function bandFor(overall: number): ScoreBand {
  if (overall >= 90) return 'GREAT'
  if (overall >= 75) return 'GOOD'
  if (overall >= 60) return 'OK'
  return 'NEEDS WORK'
}

function categorize(scoreImpact: number, state: 'open' | 'resolved'): ScoreActionItemPriority {
  if (state === 'resolved') return 'DONE'
  if (scoreImpact >= 15) return 'P1'
  if (scoreImpact >= 8) return 'P2'
  if (scoreImpact >= 1) return 'P3'
  return 'DONE'
}

function clampDelta(d: number): number {
  if (!Number.isFinite(d)) return 0
  return Math.max(-10, Math.min(10, Math.round(d)))
}

function actionTargetFor(issue: ScoreIssueStub): ScoreActionItemTarget | null {
  if (issue.state === 'resolved') return null
  switch (issue.axis) {
    case 'impact':
      if (issue.id.startsWith('impact:no-metric:')) {
        return { kind: 'editor-bullet', bulletId: issue.id }
      }
      return { kind: 'editor-section', section: 'experience' }
    case 'language':
      if (issue.id.startsWith('language:weak:')) {
        return { kind: 'editor-bullet', bulletId: issue.id }
      }
      return { kind: 'editor-section', section: 'experience' }
    case 'tailoring':
      return { kind: 'tailor' }
    case 'format':
      if (issue.id === 'format:photo') return { kind: 'editor-section', section: 'header' }
      return { kind: 'editor-section', section: 'experience' }
    case 'length':
      return { kind: 'editor-section', section: 'experience' }
  }
}

function actionLabelFor(target: ScoreActionItemTarget | null, axis: ScoreAxis): string | null {
  if (!target) return null
  if (target.kind === 'tailor') return 'Go to Tailor tab and paste your target JD'
  if (target.kind === 'editor-bullet' && axis === 'impact') {
    return 'Go to Editor and click AI ✦ on that bullet'
  }
  if (target.kind === 'editor-bullet' && axis === 'language') {
    return 'Go to Editor and rewrite that bullet'
  }
  if (target.kind === 'editor-section') return `Open ${target.section} in Editor`
  if (target.kind === 'editor-keyword') return 'Open Editor with this keyword highlighted'
  return null
}

function fallbackVerdict(band: ScoreBand): string {
  switch (band) {
    case 'GREAT':
      return 'Strong all around. The fundamentals are in place. Send it.'
    case 'GOOD':
      return 'Solid foundations with small gaps. Closing the open items will push you to interview-ready.'
    case 'OK':
      return 'Meaningful work to do. The numbers say there are real gaps — focus on the highest-impact items first.'
    case 'NEEDS WORK':
      return 'There are significant issues to address before this resume is ready to send. Start with the P1 items.'
  }
}

function fallbackExplanation(issue: ScoreIssueStub): string {
  return issue.title
}

function fallbackSubScoreExplanation(axis: ScoreAxis, score: number): string {
  switch (axis) {
    case 'impact':
      return score >= 90 ? 'Bullets quantify outcomes well.' : 'Some bullets lack measurable metrics.'
    case 'language':
      return score >= 90 ? 'Active verbs throughout.' : 'A few bullets start with weak verbs.'
    case 'tailoring':
      return score >= 90 ? 'Strong match against the active JD.' : 'No JD loaded or some keywords missing.'
    case 'format':
      return score === 100 ? 'Single column, no photos, ATS-clean.' : 'Format has issues affecting ATS parsing.'
    case 'length':
      return score === 100 ? 'Length matches your experience.' : 'Length is off for your years of experience.'
  }
}

export type MergeOptions = {
  pre: ComputeScoreResult
  refine: ScoreRefineResponseBody | null
  contentHash: string
  scoredAt: string
  modelUsed: string
  provider: 'ollama' | 'groq' | 'gemini' | 'fallback'
}

export function mergeScores(opts: MergeOptions): DashboardScoreResult {
  const { pre, refine, contentHash, scoredAt, modelUsed, provider } = opts
  const aiAvailable = refine !== null

  const languageDelta = aiAvailable ? clampDelta(refine!.languageDelta) : 0
  const languageScore = Math.max(0, Math.min(100, pre.subscoresPre.language + languageDelta))

  const finalSub = {
    impact: pre.subscoresPre.impact,
    language: languageScore,
    tailoring: pre.subscoresPre.tailoring,
    format: pre.subscoresPre.format,
    length: pre.subscoresPre.length,
  }

  const overall = computeOverall(finalSub)
  const band = bandFor(overall)
  const verdictText = aiAvailable && refine!.verdictText.trim().length > 0
    ? refine!.verdictText.trim()
    : fallbackVerdict(band)

  // Build action items from all issues in priority order
  const allIssues: ScoreIssueStub[] = [
    ...pre.issuesByAxis.impact,
    ...pre.issuesByAxis.language,
    ...pre.issuesByAxis.tailoring,
    ...pre.issuesByAxis.format,
    ...pre.issuesByAxis.length,
  ]

  const explanationMap = aiAvailable ? refine!.explanations ?? {} : {}

  const actionItems: ScoreActionItem[] = allIssues.map((issue) => {
    const priority = categorize(issue.scoreImpact, issue.state)
    const target = actionTargetFor(issue)
    const label = actionLabelFor(target, issue.axis)
    const aiBody = explanationMap[issue.id]
    const body =
      aiBody && aiBody.trim().length > 0 ? aiBody.trim() : fallbackExplanation(issue)
    return {
      id: issue.id,
      priority,
      axis: issue.axis,
      title: issue.title,
      body,
      actionLabel: priority === 'DONE' ? null : label,
      actionTarget: priority === 'DONE' ? null : target,
      scoreImpact: issue.scoreImpact,
    }
  })

  // Sort: P1 → P2 → P3 → DONE; insertion order preserved within priority
  const sorted = [...actionItems].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  )

  // Build sub-scores with explanations
  const buildSub = (axis: ScoreAxis, score: number): ScoreSubScore => {
    const issues = pre.issuesByAxis[axis]
    const issueIds = issues.map((i) => i.id)
    let explanation: string
    // Prefer the AI explanation of the highest-impact issue, else fallback
    const topIssue = [...issues].sort((a, b) => b.scoreImpact - a.scoreImpact)[0]
    if (aiAvailable && topIssue && explanationMap[topIssue.id]?.trim()) {
      explanation = explanationMap[topIssue.id].trim()
    } else {
      explanation = fallbackSubScoreExplanation(axis, score)
    }
    return { score, explanation, issueIds }
  }

  return {
    overall,
    band,
    verdictText,
    subscores: {
      impact: buildSub('impact', finalSub.impact),
      language: buildSub('language', finalSub.language),
      tailoring: buildSub('tailoring', finalSub.tailoring),
      format: buildSub('format', finalSub.format),
      length: buildSub('length', finalSub.length),
    },
    actionItems: sorted,
    scoredAt,
    scoredContentHash: contentHash,
    modelUsed,
    provider,
    aiAvailable,
  }
}
