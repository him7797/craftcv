/**
 * Build the URL handed off to the Editor when the user clicks a missing
 * keyword pill or a language-suggestion card on the Tailor screen.
 *
 * The Editor consumer (out of scope for 004) reads the `focus` query param
 * and dispatches accordingly.
 */
export function buildKeywordFocusUrl(keyword: string): string {
  const value = encodeURIComponent(`keyword:${keyword.trim()}`)
  return `/editor?focus=${value}`
}

export function buildBulletFocusUrl(resumeSays: string): string {
  const value = encodeURIComponent(`bullet:${shortHash(resumeSays)}`)
  return `/editor?focus=${value}`
}

/**
 * Lightweight non-cryptographic hash for an opaque bullet identifier.
 * Stable for the same input; fits in 12 hex chars.
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
