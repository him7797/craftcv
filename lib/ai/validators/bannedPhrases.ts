import type { BlockContent } from '@/lib/types'

export const BANNED_PHRASES = [
  'responsible for',
  'helped with',
  'worked on',
  'took part in',
  'involved in',
  'assisted with',
  'participated in',
  'utilize',
  'leverage',
  'synergize',
  'passionate',
  'detail-oriented',
  'team player',
  'go-getter',
  'hard worker',
  'strong communicator',
]

function extractText(content: BlockContent): string {
  switch (content.blockType) {
    case 'experience-description':
      return content.text
    case 'experience-bullets':
      return content.bullets.join(' ')
    case 'project-block':
      return [content.name, content.description, ...content.bullets].join(' ')
    case 'skills-section':
      return content.categories.flatMap((c) => c.items).join(' ')
  }
}

export function checkBannedPhrases(content: BlockContent): string | null {
  const text = extractText(content).toLowerCase()
  for (const phrase of BANNED_PHRASES) {
    if (text.includes(phrase.toLowerCase())) return phrase
  }
  return null
}
