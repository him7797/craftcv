import type { AtsFlags, Resume } from '@/lib/types'

/**
 * Derive ATS-cleanliness indicators from the resume's structural metadata.
 * Defaults to passing (true) when meta is undefined or fields are missing —
 * absence of evidence is treated as ATS-clean rather than as a failure.
 */
export function deriveAtsFlags(resume: Resume): AtsFlags {
  const meta = resume.meta
  return {
    singleColumn: meta?.isMultiColumn !== true,
    noPhotos: meta?.hasPhoto !== true,
  }
}
