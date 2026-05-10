import type { SmartCatch, Version } from '@/lib/types'
import { extractKeywords, normalizeForMatch } from './keywordExtractor'
import { flattenAllSections, flattenResumeText } from './flattenResume'
import { isKeywordInText } from './keywordMatcher'

type FindInput = {
  jdText: string
  activeVersion: Version
  allVersions: Version[]
}

/**
 * For each missing keyword, scan:
 *   (a) all *other* versions' flattened text
 *   (b) the active version's projects[] sub-tree (descriptions + tech)
 *   (c) skills overflow not surfaced in active sections
 * and emit a SmartCatch when content is found elsewhere in the user's data.
 *
 * In US2 we treat all sections of the active version as "active" for
 * keyword matching, so smart-catches come from other versions and projects.
 */
export function findSmartCatches(input: FindInput): SmartCatch[] {
  const { jdText, activeVersion, allVersions } = input
  if (!jdText.trim()) return []

  const jdKeywords = extractKeywords(jdText)
  const activeText = flattenResumeText(activeVersion.resume)

  // Determine which JD keywords are missing from the active resume — these
  // are the candidates for smart-catch.
  const missing = jdKeywords.filter((k) => !isKeywordInText(k, activeText))
  if (missing.length === 0) return []

  // Per-section blocks of the active version (so we can label "Candidate Pay project")
  const activeBlocks = flattenAllSections(activeVersion.resume).filter(
    (b) => b.sectionLabel.toLowerCase().includes('project') ||
      b.sectionLabel.toLowerCase().includes('skills'),
  )

  // Other versions, full-text
  const otherVersions = allVersions.filter((v) => v.id !== activeVersion.id)

  const catches: SmartCatch[] = []
  const seen = new Set<string>()

  for (const keyword of missing) {
    if (seen.has(normalizeForMatch(keyword))) continue

    // Check non-active sections of the active version first (projects, skills overflow)
    const localHit = activeBlocks.find((b) => isKeywordInText(keyword, b.text))
    if (localHit) {
      catches.push({
        keyword,
        foundIn: localHit.sectionLabel,
        suggestion: 'Surface this in your active sections.',
      })
      seen.add(normalizeForMatch(keyword))
      continue
    }

    // Then check other versions
    const otherHit = otherVersions.find((v) =>
      isKeywordInText(keyword, flattenResumeText(v.resume)),
    )
    if (otherHit) {
      catches.push({
        keyword,
        foundIn: `${otherHit.name} version`,
        suggestion: 'Add it.',
      })
      seen.add(normalizeForMatch(keyword))
      continue
    }
  }

  return catches
}
