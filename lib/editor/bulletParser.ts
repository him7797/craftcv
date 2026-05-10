import type { BulletToken } from '@/lib/types'

const TOKEN = /\{\{([mti]):((?:[^}]|\}(?!\}))*)\}\}/g

export function tokenize(source: string): BulletToken[] {
  const tokens: BulletToken[] = []
  let cursor = 0

  TOKEN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN.exec(source)) !== null) {
    if (match.index > cursor) {
      tokens.push({ kind: 'text', value: source.slice(cursor, match.index) })
    }
    const kindChar = match[1]
    const value = match[2]
    const kind = kindChar === 'm' ? 'metric' : kindChar === 't' ? 'tech' : 'italic'
    tokens.push({ kind, value })
    cursor = match.index + match[0].length
  }
  if (cursor < source.length) {
    tokens.push({ kind: 'text', value: source.slice(cursor) })
  }
  return tokens
}

export function emit(tokens: BulletToken[]): string {
  return tokens
    .map((t) => {
      if (t.kind === 'text') return t.value
      const c = t.kind === 'metric' ? 'm' : t.kind === 'tech' ? 't' : 'i'
      return `{{${c}:${t.value}}}`
    })
    .join('')
}
