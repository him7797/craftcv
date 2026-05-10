'use client'

import { useCallback } from 'react'
import { useStore } from '@/lib/store'
import { useTailorStore } from '@/lib/store/useTailorStore'
import { runAnalysis, AnalysisError } from '@/lib/tailor/analyseJd'
import { findSmartCatches } from '@/lib/tailor/smartCatchFinder'
import PasteJdTextarea from './PasteJdTextarea'
import AnalyseButton from './AnalyseButton'
import PrivacyStatusLine from './PrivacyStatusLine'
import SavedProfilesList from './SavedProfilesList'
import SaveCurrentJdButton from './SaveCurrentJdButton'
import SaveJdModal from './SaveJdModal'

export default function JdInputColumn({
  saveModalOpen,
  setSaveModalOpen,
}: {
  saveModalOpen: boolean
  setSaveModalOpen: (open: boolean) => void
}) {
  const handleAnalyse = useCallback(async () => {
    const tailorState = useTailorStore.getState()
    const resumeState = useStore.getState()

    const jdText = tailorState.draftJdText.trim()
    if (!jdText) return
    if (tailorState.analysing) return

    const activeVersionId = resumeState.editor.activeVersionId
    const activeVersion = resumeState.versions[activeVersionId]
    if (!activeVersion) {
      tailorState.setError('No active resume version. Upload a resume first.')
      return
    }

    tailorState.setError(null)
    tailorState.setAnalysing(true)

    try {
      const allVersions = Object.values(resumeState.versions)
      const smartCatches = findSmartCatches({
        jdText,
        activeVersion,
        allVersions,
      })

      const result = await runAnalysis({
        jdText,
        activeResume: activeVersion.resume,
        smartCatches,
      })
      tailorState.setResult(result)
    } catch (err) {
      const message =
        err instanceof AnalysisError
          ? humanizeError(err)
          : err instanceof Error
            ? err.message
            : 'Unknown error during analysis.'
      tailorState.setError(message)
    } finally {
      tailorState.setAnalysing(false)
    }
  }, [])

  return (
    <>
      <SavedProfilesList />
      <SaveCurrentJdButton onClick={() => setSaveModalOpen(true)} />

      <div className="tailor-paste-wrap">
        <div className="tailor-side-h" style={{ marginBottom: 12 }}>
          PASTE JOB DESCRIPTION
        </div>
        <PasteJdTextarea onSubmit={handleAnalyse} />
      </div>

      <AnalyseButton onAnalyse={handleAnalyse} />
      <PrivacyStatusLine />

      <SaveJdModal open={saveModalOpen} onClose={() => setSaveModalOpen(false)} />
    </>
  )
}

function humanizeError(err: AnalysisError): string {
  switch (err.payload.error) {
    case 'invalid-request':
      return err.payload.message ?? 'Invalid analysis request.'
    case 'provider-unavailable':
      return 'AI provider unreachable. Check that Ollama is running, or switch providers.'
    case 'rate-limited':
      return 'Provider rate-limited. Try again shortly.'
    case 'malformed-output':
      return 'AI returned an unreadable response. Try Analyse again.'
    case 'timeout':
      return 'Analysis timed out. Try again.'
    case 'empty-response':
      return 'AI returned no response. Try again.'
    default:
      return err.payload.message ?? 'Analysis failed.'
  }
}
