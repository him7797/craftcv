import { callLLM } from '../llm'
import { scoreResume } from '../scorer'
import type { ExtractionSummary, ParseResult, Resume } from '../types'
import { DocxExtractError, extractDocx } from './extract-docx'
import { PdfExtractError, extractPdf } from './extract-pdf'

// PDF magic bytes: %PDF
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46])
// DOCX magic bytes: PK (ZIP)
const DOCX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04])

function detectMime(buffer: Buffer): 'pdf' | 'docx' | null {
  if (buffer.subarray(0, 4).equals(PDF_MAGIC)) return 'pdf'
  if (buffer.subarray(0, 4).equals(DOCX_MAGIC)) return 'docx'
  return null
}

function isEnglish(text: string): boolean {
  const chars = text.replace(/\s+/g, '').split('')
  if (chars.length === 0) return true
  const asciiCount = chars.filter((c) => c.charCodeAt(0) < 128).length
  return asciiCount / chars.length >= 0.6
}

const RESUME_SCHEMA = `{
  "header": { "name": "string", "location": "string?", "email": "string?", "links": [{"label":"string","url":"string"}]? },
  "experience": [{ "company": "string", "role": "string", "startDate": "MMM YYYY", "endDate": "MMM YYYY or Present", "bullets": ["string"] }],
  "skills": [{ "category": "string", "items": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "startYear": "string", "endYear": "string" }],
  "projects": [{ "name": "string", "description": "string", "tech": ["string"]?, "link": "string?" }]?
}`

function buildPrompt(text: string, strict = false): string {
  const strictNote = strict
    ? '\nCRITICAL: Your previous response was not valid JSON. Return ONLY the JSON object with no other text.'
    : ''
  return `You are a resume parser. Extract structured data from the resume text below.${strictNote}

RULES:
1. Return ONLY valid JSON — no markdown, no explanation, no code fences.
2. Use ONLY information explicitly present in the resume text. Do NOT invent or hallucinate data.
3. Match this exact schema: ${RESUME_SCHEMA}
4. For missing optional fields, omit them entirely (do not use null or empty strings).
5. Dates must be in "MMM YYYY" format (e.g. "Jan 2022"). Use "Present" for current roles.

RESUME TEXT:
${text}

JSON OUTPUT:`
}

function validateResumeShape(obj: unknown): obj is Resume {
  if (typeof obj !== 'object' || obj === null) return false
  const r = obj as Record<string, unknown>
  if (typeof r.header !== 'object' || r.header === null) return false
  if (!Array.isArray(r.experience)) return false
  if (!Array.isArray(r.skills)) return false
  if (!Array.isArray(r.education)) return false
  const h = r.header as Record<string, unknown>
  if (typeof h.name !== 'string' || h.name.trim() === '') return false
  return true
}

function buildExtractionSummary(resume: Resume): ExtractionSummary {
  let totalBullets = 0
  for (const exp of resume.experience) {
    totalBullets += exp.bullets?.length ?? 0
    for (const client of exp.clients ?? []) totalBullets += client.bullets.length
  }

  return {
    header: true,
    experience: { positions: resume.experience.length, bullets: totalBullets },
    skills: {
      categories: resume.skills.length,
      items: resume.skills.reduce((acc, s) => acc + s.items.length, 0),
    },
    education: resume.education.length,
    projects: resume.projects?.length ?? 0,
  }
}

function detectMissingFields(resume: Partial<Resume>): string[] {
  const missing: string[] = []
  if (!resume.header?.name) missing.push('header')
  if (!resume.experience?.length) missing.push('experience')
  if (!resume.skills?.length) missing.push('skills')
  if (!resume.education?.length) missing.push('education')
  return missing
}

export async function parseResume(
  buffer: Buffer,
  mimeTypeHint: string,
): Promise<ParseResult> {
  // Stage 1: MIME detection
  const detectedMime = detectMime(buffer)
  if (!detectedMime) {
    return {
      status: 'error',
      reason: 'wrong-format',
      message: 'File format not recognized. Upload a text-based PDF or DOCX file.',
    }
  }

  // Stage 2: Text extraction
  let rawText: string
  let pageCount = 1
  let hasImages = false

  try {
    if (detectedMime === 'pdf') {
      const result = await extractPdf(buffer)
      rawText = result.text
      pageCount = result.pageCount
      hasImages = result.hasImages
    } else {
      const result = await extractDocx(buffer)
      rawText = result.text
    }
  } catch (err) {
    if (err instanceof PdfExtractError) {
      if (err.code === 'SCANNED') {
        return {
          status: 'error',
          reason: 'scanned',
          message:
            'The PDF appears to be a scanned image with no embedded text. Try a text-based PDF or upload the DOCX version.',
        }
      }
      if (err.code === 'TOO_MANY_PAGES') {
        return {
          status: 'error',
          reason: 'too-large',
          message: 'Resume too long, please trim to under 10 pages.',
        }
      }
    }
    return {
      status: 'error',
      reason: 'corrupt',
      message: 'File appears to be corrupt or empty.',
    }
  }

  // Language detection
  if (!isEnglish(rawText)) {
    return {
      status: 'error',
      reason: 'non-english',
      message: 'Only English resumes are supported in v1.',
    }
  }

  // Stage 3: LLM parse with retry
  let parsed: Resume | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = buildPrompt(rawText, attempt > 0)
    let rawResponse: string

    try {
      rawResponse = await callLLM(prompt)
    } catch {
      break
    }

    // Strip markdown code fences if present
    const cleaned = rawResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    try {
      const obj: unknown = JSON.parse(cleaned)
      if (validateResumeShape(obj)) {
        parsed = obj as Resume
        break
      }
    } catch {
      // retry
    }
  }

  // Stage 4: Score + build result
  if (!parsed) {
    // Partial fallback
    return {
      status: 'partial',
      resume: {},
      missingFields: ['header', 'experience', 'skills', 'education'],
      score: { score: 0, band: 'needs-work', issues: [] },
    }
  }

  // Attach meta
  parsed.meta = {
    hasPhoto: hasImages,
    pageCount,
    isMultiColumn: false,
    detectedLanguage: 'en',
  }

  const missingFields = detectMissingFields(parsed)
  const score = scoreResume(parsed)

  if (missingFields.length > 0) {
    return {
      status: 'partial',
      resume: parsed,
      missingFields,
      score,
    }
  }

  return {
    status: 'success',
    resume: parsed,
    score,
    extractionSummary: buildExtractionSummary(parsed),
  }
}
