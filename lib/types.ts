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
