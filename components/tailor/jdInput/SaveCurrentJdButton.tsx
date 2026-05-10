'use client'

type Props = {
  onClick: () => void
}

export default function SaveCurrentJdButton({ onClick }: Props) {
  return (
    <button type="button" className="tailor-save-current" onClick={onClick}>
      + SAVE CURRENT JD
    </button>
  )
}
