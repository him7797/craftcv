export default function ScoreNumber({ score }: { score: number }) {
  return (
    <div className="tailor-score-num">
      {score}
      <small>/100</small>
    </div>
  )
}
