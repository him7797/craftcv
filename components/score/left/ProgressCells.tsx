type Props = {
  score: number
}

export default function ProgressCells({ score }: Props) {
  const filled = Math.max(0, Math.min(8, Math.ceil(score / 10)))
  const cells = Array.from({ length: 8 }, (_, i) => i < filled)
  return (
    <div className="score-progress-cells" aria-label={`Progress: ${filled} of 8 buckets`}>
      {cells.map((on, i) => (
        <span key={i} className={`score-progress-cell${on ? ' filled' : ''}`} aria-hidden />
      ))}
    </div>
  )
}
