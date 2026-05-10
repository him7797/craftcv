type Props = {
  label: string
  value: number
}

export default function SubScoreRow({ label, value }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="tailor-subscore">
      <div className="tailor-subscore-head">
        <span>{label}</span>
        <span>{clamped}</span>
      </div>
      <div className="tailor-subscore-bar">
        <div className="tailor-subscore-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
