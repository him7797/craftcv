'use client'

export default function SubScoreRow({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="editor-subscore-row">
      <div className="editor-subscore-head">
        <span>{label}</span>
        <span>{Math.round(pct)}</span>
      </div>
      <div className="editor-subscore-bar">
        <div className="editor-subscore-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
