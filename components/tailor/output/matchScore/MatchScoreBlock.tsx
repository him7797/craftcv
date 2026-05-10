import type { AnalysisResult } from '@/lib/types'
import ScoreNumber from './ScoreNumber'
import SubScoreRow from './SubScoreRow'

function summary(score: number, missingCount: number): string {
  if (score >= 81) return 'Strong match — ready to apply'
  if (score >= 60) return `Good match — ${missingCount} gap${missingCount === 1 ? '' : 's'} to close`
  return 'Weak match — significant gaps'
}

export default function MatchScoreBlock({ result }: { result: AnalysisResult }) {
  return (
    <div className="tailor-out-block">
      <div className="tailor-out-h">MATCH SCORE</div>
      <div className="tailor-score-row">
        <ScoreNumber score={result.matchScore} />
        <div>
          <SubScoreRow label="TECHNOLOGIES" value={result.subscores.technologies} />
          <SubScoreRow label="LANGUAGE MIRROR" value={result.subscores.languageMirror} />
          <SubScoreRow label="DOMAIN TERMS" value={result.subscores.domainTerms} />
        </div>
      </div>
      <div className="tailor-score-summary">
        {summary(result.matchScore, result.keywords.missing.length)}
      </div>
    </div>
  )
}
