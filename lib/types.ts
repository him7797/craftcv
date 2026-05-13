export type Resume = {
  header: {
    name: string
    location?: string
    email?: string
    links?: { label: string; url: string }[]
  }
  experience: {
    company: string
    role: string
    startDate: string
    endDate: string
    description?: string
    clients?: {
      name: string
      tech?: string[]
      startDate: string
      endDate: string
      bullets: string[]
    }[]
    bullets?: string[]
  }[]
  skills: { category: string; items: string[] }[]
  education: {
    institution: string
    degree: string
    startYear: string
    endYear: string
  }[]
  projects?: {
    name: string
    description: string
    tech?: string[]
    link?: string
    bullets?: string[]
  }[]
  meta?: {
    hasPhoto: boolean
    pageCount: number
    isMultiColumn: boolean
    detectedLanguage: string
  }
}

export type ExtractionSummary = {
  header: boolean
  experience: { positions: number; bullets: number }
  skills: { categories: number; items: number }
  education: number
  projects: number
}

export type ScoreResult = {
  score: number
  band: 'needs-work' | 'good' | 'great'
  issues: { impact: 'high' | 'medium' | 'low'; message: string }[]
}

export type ParseResult =
  | {
      status: 'success'
      resume: Resume
      score: ScoreResult
      extractionSummary: ExtractionSummary
    }
  | {
      status: 'partial'
      resume: Partial<Resume>
      missingFields: string[]
      score: ScoreResult
    }
  | {
      status: 'error'
      reason: 'corrupt' | 'scanned' | 'non-english' | 'too-large' | 'wrong-format'
      message: string
    }

export type ParseStage =
  | 'file-loaded'
  | 'extracting-text'
  | 'parsing-sections'
  | 'applying-guidelines'

export type UploadPageState =
  | { phase: 'idle' }
  | { phase: 'drag-over' }
  | { phase: 'selected'; file: File }
  | { phase: 'parsing'; file: File; stage: ParseStage; statusMessage: string }
  | { phase: 'success'; file: File; result: Extract<ParseResult, { status: 'success' }> }
  | { phase: 'partial'; file: File; result: Extract<ParseResult, { status: 'partial' }>; score: ScoreResult }
  | { phase: 'error'; file: File; result: Extract<ParseResult, { status: 'error' }> }

// ─── Editor (003-editor-screen) ──────────────────────────────────────────────

export type EditorSection =
  | 'experience'
  | 'skills'
  | 'education'
  | 'projects'
  | 'header'

export type Version = {
  id: string
  name: string
  resume: Resume
  branchedFromId: string | null
  createdAt: string
}

export type BulletPath =
  | { section: 'experience'; expIndex: number; clientIndex: number | null; bulletIndex: number }
  | { section: 'projects'; projectIndex: number; bulletIndex: number }

export type ParentPath =
  | { section: 'experience'; expIndex: number; clientIndex: number | null }
  | { section: 'projects'; projectIndex: number }

export type BulletToken =
  | { kind: 'text'; value: string }
  | { kind: 'metric'; value: string }
  | { kind: 'tech'; value: string }
  | { kind: 'italic'; value: string }

export type AiSessionTarget = BulletPath | { section: 'new-bullet'; parent: ParentPath }

export type AiSession = {
  target: AiSessionTarget
  rough: string
  suggestion: string
  streaming: boolean
  retriesLeft: number
  hint?: 'different-angle' | 'shorter' | 'add-metric'
  error?: string
}

export type SubScores = {
  impact: number
  language: number
  tailoring: number
  format: number
}

export type FixTarget =
  | { kind: 'bullet'; path: BulletPath }
  | { kind: 'section'; section: EditorSection }
  | { kind: 'tab'; tab: 'preview' | 'tailor' | 'score' }

export type Fix = {
  id: string
  axis: keyof SubScores
  state: 'open' | 'resolved'
  priority: 'high' | 'medium' | 'low'
  message: string
  hint?: string
  target?: FixTarget
}

export type Score = {
  overall: number
  band: 'needs-work' | 'good' | 'great'
  subScores: SubScores
  fixes: Fix[]
}

export type EditorState = {
  activeSection: EditorSection
  activeVersionId: string
  aiSession: AiSession | null
  retryCounts: Record<string, number>
  lastSavedAt: string | null
}

// LLM status (returned by GET /api/llm-status)
export type LlmStatus = {
  provider: 'ollama' | 'groq' | 'gemini'
  model: { rewrite: string; score: string }
  status: 'running' | 'connected' | 'rate-limited' | 'down'
  usage?: { used: number; limit: number }
}

// ─── Persistence snapshot (localStorage key 'craftcv:resume:v1') ─────────────

export type PersistedSnapshot = {
  schemaVersion: 1
  activeVersionId: string
  versions: Record<string, Version>
  lastSavedAt: string
}

// ─── Tailor (004-tailor-screen) ──────────────────────────────────────────────

export type SmartCatch = {
  keyword: string
  foundIn: string
  suggestion: string
}

export type LanguageSuggestion = {
  resumeSays: string
  jdLanguage: string
  rationale?: string
}

export type AnalysisResult = {
  matchScore: number
  subscores: {
    technologies: number
    languageMirror: number
    domainTerms: number
  }
  keywords: {
    present: string[]
    missing: string[]
  }
  smartCatches: SmartCatch[]
  languageSuggestions: LanguageSuggestion[]
  analysedAt: string
  modelUsed: string
}

export type JdProfile = {
  id: string
  name: string
  jdText: string
  lastAnalysis: AnalysisResult | null
  createdAt: string
}

export type TailorPersistedProfiles = {
  schemaVersion: 1
  profiles: JdProfile[]
  activeProfileId: string | null
}

export type TailorPersistedDraft = {
  schemaVersion: 1
  draftJdText: string
  savedAt: string
}

// ─── Preview (005-preview-screen) ────────────────────────────────────────────

export type FitStatus = 'underfilled' | 'good' | 'overfilled'

export type PageMeasurement = {
  pageCount: number
  fitStatus: FitStatus
  overflowPx: number
  measuredAt: string
}

export type AtsFlags = {
  singleColumn: boolean
  noPhotos: boolean
}

export type PreviewState = {
  measurement: PageMeasurement | null
  setMeasurement: (m: PageMeasurement) => void
}

// ─── Score (006-score-screen) ────────────────────────────────────────────────

export type ScoreBand = 'NEEDS WORK' | 'OK' | 'GOOD' | 'GREAT'

export type ScoreSubScore = {
  score: number
  explanation: string
  issueIds: string[]
}

export type ScoreActionItemPriority = 'P1' | 'P2' | 'P3' | 'DONE'

export type ScoreAxis = 'impact' | 'language' | 'tailoring' | 'format' | 'length'

export type ScoreActionItemTarget =
  | { kind: 'editor-section'; section: 'experience' | 'skills' | 'education' | 'projects' | 'header' }
  | { kind: 'editor-bullet'; bulletId: string }
  | { kind: 'editor-keyword'; keyword: string }
  | { kind: 'tailor' }
  | { kind: 'editor-block-rewrite'; blockType: BlockType; blockId: string }

export type ScoreActionItem = {
  id: string
  priority: ScoreActionItemPriority
  axis: ScoreAxis
  title: string
  body: string
  actionLabel: string | null
  actionTarget: ScoreActionItemTarget | null
  scoreImpact: number
}

export type DashboardScoreResult = {
  overall: number
  band: ScoreBand
  verdictText: string
  subscores: {
    impact: ScoreSubScore
    language: ScoreSubScore
    tailoring: ScoreSubScore
    format: ScoreSubScore
    length: ScoreSubScore
  }
  actionItems: ScoreActionItem[]
  scoredAt: string
  scoredContentHash: string
  modelUsed: string
  provider: 'ollama' | 'groq' | 'gemini' | 'fallback'
  aiAvailable: boolean
}

export type ScoreHistoryEntry = {
  weekIsoLabel: string
  score: number
  scoredAt: string
}

export type ScoreState = {
  result: DashboardScoreResult | null
  scoring: boolean
  error: string | null
  scoresByVersionId: Record<string, DashboardScoreResult>
  historyByVersionId: Record<string, ScoreHistoryEntry[]>
  hydrated: boolean
  hydrate: () => void
  runScore: (force?: boolean) => Promise<void>
  setResult: (versionId: string, r: DashboardScoreResult) => void
  clearError: () => void
  resolveActionItem: (id: string) => void
}

export type AiEngineStatus = 'idle' | 'scoring' | 'unavailable'

// ─── Block Rewrite (007-ai-block-rewrite) ────────────────────────────────────

export type BlockType =
  | 'experience-description'
  | 'project-block'
  | 'experience-bullets'
  | 'skills-section'

export type BlockPath =
  | { blockType: 'experience-description'; expIndex: number }
  | { blockType: 'project-block'; projectIndex: number }
  | { blockType: 'experience-bullets'; expIndex: number; clientIndex: number | null }
  | { blockType: 'skills-section' }

export type BlockContent =
  | { blockType: 'experience-description'; text: string }
  | {
      blockType: 'project-block'
      name: string
      description: string
      tech: string[]
      bullets: string[]
      link?: string
    }
  | { blockType: 'experience-bullets'; bullets: string[] }
  | { blockType: 'skills-section'; categories: { category: string; items: string[] }[] }

export type DiffAnnotation = {
  added: string[]
  removed: string[]
  modified: { from: string; to: string }[]
}

export type RewriteResult = {
  blockType: BlockType
  before: BlockContent
  after: BlockContent
  diff: DiffAnnotation
  rationale: string
  guidelinesApplied: string[]
  warning?: 'may-not-match-guidelines'
}

export type RetryHint =
  | 'different-angle'
  | 'shorter'
  | 'more-metrics'
  | 'less-jargon'
  | 'simpler-language'

export type BlockRewriteSession = {
  blockPath: BlockPath
  streaming: boolean
  rawStreamText: string
  suggestion: RewriteResult | null
  retriesLeft: number
  error: string | null
  previousContent: BlockContent | null
  editMode: boolean
}

export type RewriteBlockEvent =
  | { type: 'token'; value: string }
  | { type: 'done'; result: RewriteResult }
  | { type: 'retry'; reason: 'banned-phrase' | 'hallucination' }
  | { type: 'error'; message: string }
