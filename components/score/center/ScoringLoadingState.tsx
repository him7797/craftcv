import { getActiveProvider, getModelLabel } from '@/lib/score/modelLabels'

export default function ScoringLoadingState() {
  const model = getModelLabel(getActiveProvider())
  return (
    <div className="score-loading">
      <span className="score-loading-glyph">↻</span>
      <span className="score-loading-text">{model} is reading your resume...</span>
    </div>
  )
}
