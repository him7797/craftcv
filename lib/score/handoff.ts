import type { BlockPath, ScoreActionItemTarget } from '@/lib/types'

export function buildEditorFocusUrl(target: ScoreActionItemTarget): string {
  switch (target.kind) {
    case 'editor-section':
      return `/editor?focus=${encodeURIComponent(`section:${target.section}`)}`
    case 'editor-bullet':
      return `/editor?focus=${encodeURIComponent(`bullet:${target.bulletId}`)}`
    case 'editor-keyword':
      return `/editor?focus=${encodeURIComponent(`keyword:${target.keyword}`)}`
    case 'tailor':
      return '/tailor'
    case 'editor-block-rewrite':
      return `/editor?focus=${encodeURIComponent(`rewrite:${target.blockType}:${target.blockId}`)}`
  }
}

/**
 * Parses a score issue ID into a block-level BlockPath for dispatchBlockRewrite.
 * Issue ID format (from lib/editor/score/rules/impact.ts + language.ts):
 *   "impact:no-metric:e-{expIndex}-{clientIndex|top}-{bulletIndex}"
 *   "language:weak:e-{expIndex}-{clientIndex|top}-{bulletIndex}"
 *   "impact:no-metric:p-{projectIndex}-{bulletIndex}"
 * Returns null if the format is not recognized or parsed values are invalid.
 */
export function bulletIdToBlockPath(bulletId: string): BlockPath | null {
  const parts = bulletId.split(':')
  const pathSeg = parts[parts.length - 1]

  if (pathSeg.startsWith('e-')) {
    const segments = pathSeg.slice(2).split('-')
    const expIndex = parseInt(segments[0], 10)
    if (Number.isNaN(expIndex)) return null
    const clientRaw = segments[1]
    const clientIndex = clientRaw === 'top' || clientRaw === undefined ? null : parseInt(clientRaw, 10)
    return {
      blockType: 'experience-bullets',
      expIndex,
      clientIndex: typeof clientIndex === 'number' && Number.isNaN(clientIndex) ? null : clientIndex,
    }
  }

  if (pathSeg.startsWith('p-')) {
    const segments = pathSeg.slice(2).split('-')
    const projectIndex = parseInt(segments[0], 10)
    if (Number.isNaN(projectIndex)) return null
    return { blockType: 'project-block', projectIndex }
  }

  return null
}

/**
 * Lightweight non-cryptographic hash for opaque identifiers.
 * Stable for the same input.
 */
export function shortHash(input: string): string {
  let h1 = 0xdeadbeef ^ 0
  let h2 = 0x41c6ce57 ^ 0
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const u1 = (h1 >>> 0).toString(16).padStart(8, '0')
  const u2 = (h2 >>> 0).toString(16).padStart(8, '0')
  return (u1 + u2).slice(0, 12)
}
