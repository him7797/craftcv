import type { ScoreActionItemTarget } from '@/lib/types'

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
