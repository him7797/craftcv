import type { ScoreHistoryEntry } from '@/lib/types'

/**
 * ISO 8601 week label for a Date in the user's local timezone.
 * Returns 'YYYY-Www', e.g. '2026-W19'.
 */
export function isoWeekLabel(date: Date = new Date()): string {
  const target = new Date(date.getTime())
  // Move to nearest Thursday: ISO weeks are defined relative to Thursdays.
  const dayNum = (target.getDay() + 6) % 7 // Mon = 0 .. Sun = 6
  target.setDate(target.getDate() - dayNum + 3)
  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const weekNum =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    )
  const ww = weekNum.toString().padStart(2, '0')
  return `${target.getFullYear()}-W${ww}`
}

export function currentIsoWeekLabel(): string {
  return isoWeekLabel(new Date())
}

/**
 * Display label for a given history entry relative to the others shown.
 * The most recent entry is always 'NOW'; older entries become 'WK1'..'WK5'
 * from oldest to newest.
 */
export function relativeWeekLabel(
  entry: ScoreHistoryEntry,
  allEntries: ScoreHistoryEntry[],
): string {
  if (allEntries.length === 0) return 'NOW'
  const sorted = [...allEntries].sort((a, b) => a.scoredAt.localeCompare(b.scoredAt))
  const idx = sorted.findIndex((e) => e.weekIsoLabel === entry.weekIsoLabel)
  if (idx === sorted.length - 1) return 'NOW'
  if (idx < 0) return ''
  // older entries: WK1 = oldest, WK(n-1) = second-newest
  return `WK${idx + 1}`
}
