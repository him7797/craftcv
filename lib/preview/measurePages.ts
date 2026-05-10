import type { PageMeasurement } from '@/lib/types'

/**
 * US Letter at 96 dpi minus 64 px top + 64 px bottom padding.
 * 11 in × 96 dpi = 1056 px total height; 1056 − 128 = 928 px usable.
 */
export const USABLE_PAGE_HEIGHT_PX = 928

const UNDERFILL_THRESHOLD = 0.7
const OVERFILL_TOLERANCE_PX = 50

/**
 * Pure measurement — given the document's rendered content height in px,
 * return page count + fit status. No DOM access.
 */
export function measurePages(contentHeightPx: number): PageMeasurement {
  const safeHeight = Math.max(0, contentHeightPx)
  const exact = safeHeight / USABLE_PAGE_HEIGHT_PX
  const pageCount = Math.max(1, Math.ceil(exact))
  const measuredAt = new Date().toISOString()

  // underfilled: content is < 70% of one page
  if (pageCount === 1 && safeHeight < UNDERFILL_THRESHOLD * USABLE_PAGE_HEIGHT_PX) {
    return {
      pageCount,
      fitStatus: 'underfilled',
      overflowPx: 0,
      measuredAt,
    }
  }

  // overfilled: content overflows a clean page boundary by > tolerance
  const cleanBoundaryHeight = pageCount * USABLE_PAGE_HEIGHT_PX
  const overflowPx = Math.max(0, safeHeight - cleanBoundaryHeight)
  if (safeHeight > cleanBoundaryHeight + OVERFILL_TOLERANCE_PX) {
    return {
      pageCount: pageCount + 1,
      fitStatus: 'overfilled',
      overflowPx: safeHeight - (pageCount + 1) * USABLE_PAGE_HEIGHT_PX,
      measuredAt,
    }
  }

  // also flag overfill if the content is in the "ugly tail" of the last page
  const tailFraction = (safeHeight - (pageCount - 1) * USABLE_PAGE_HEIGHT_PX) / USABLE_PAGE_HEIGHT_PX
  if (pageCount >= 2 && tailFraction > 0 && tailFraction < UNDERFILL_THRESHOLD) {
    // last page is sparse but still considered "good" — recruiter-acceptable
    return { pageCount, fitStatus: 'good', overflowPx: 0, measuredAt }
  }

  return {
    pageCount,
    fitStatus: 'good',
    overflowPx,
    measuredAt,
  }
}
