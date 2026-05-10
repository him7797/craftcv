type Props = {
  score: number | null
  label: string
  isNow: boolean
}

const USABLE_PX = 100

export default function HistoryBar({ score, label, isNow }: Props) {
  if (score === null) {
    // empty placeholder slot
    return (
      <div className="score-history-bar-col">
        <span className="score-history-bar-num">—</span>
        <div className={`score-history-bar${isNow ? ' now' : ''}`} style={{ height: 4 }} />
        <span className="score-history-bar-label">{label}</span>
      </div>
    )
  }
  const heightPx = Math.max(2, Math.round((score / 100) * USABLE_PX))
  return (
    <div className="score-history-bar-col">
      <span className="score-history-bar-num">{score}</span>
      <div className={`score-history-bar${isNow ? ' now' : ''}`} style={{ height: heightPx }} />
      <span className="score-history-bar-label">{label}</span>
    </div>
  )
}
