'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  label: string
  value: number
  explanation: string
}

export default function SubScoreRow({ label, value, explanation }: Props) {
  const [width, setWidth] = useState(0)
  const mountedRef = useRef(false)

  useEffect(() => {
    // Animate width: 0 → value% over the CSS transition
    if (!mountedRef.current) {
      mountedRef.current = true
      const id = requestAnimationFrame(() => setWidth(value))
      return () => cancelAnimationFrame(id)
    }
    setWidth(value)
  }, [value])

  const fillClass = value >= 100 ? 'score-subscore-fill green' : 'score-subscore-fill'

  return (
    <div className="score-subscore-row">
      <div className="score-subscore-head">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="score-subscore-bar">
        <div className={fillClass} style={{ width: `${width}%` }} />
      </div>
      <div className="score-subscore-explanation">{explanation}</div>
    </div>
  )
}
