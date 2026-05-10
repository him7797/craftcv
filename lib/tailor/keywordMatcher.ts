import { normalizeForMatch } from './keywordExtractor'

export type KeywordDiff = {
  present: string[]
  missing: string[]
}

/**
 * Diff JD keywords against resume text.
 * `jdKeywords` keeps original (vocabulary) casing for handoff payloads.
 * `resumeText` is the full flattened resume body.
 */
export function diffKeywords(jdKeywords: string[], resumeText: string): KeywordDiff {
  const haystack = normalizeForMatch(resumeText)
  const present: string[] = []
  const missing: string[] = []

  for (const kw of jdKeywords) {
    const needle = normalizeForMatch(kw)
    if (!needle) continue
    if (haystack.includes(needle)) {
      present.push(kw)
    } else {
      missing.push(kw)
    }
  }

  return { present, missing }
}

export function isKeywordInText(keyword: string, text: string): boolean {
  const haystack = normalizeForMatch(text)
  const needle = normalizeForMatch(keyword)
  if (!needle) return false
  return haystack.includes(needle)
}
