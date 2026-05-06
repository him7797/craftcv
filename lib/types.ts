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
