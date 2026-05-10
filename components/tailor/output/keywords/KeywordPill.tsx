'use client'

type Props = {
  keyword: string
  variant: 'present' | 'missing'
  onClick?: (keyword: string) => void
}

function displayForm(keyword: string): string {
  return keyword.trim().toUpperCase()
}

export default function KeywordPill({ keyword, variant, onClick }: Props) {
  const className = `tailor-pill tailor-pill-${variant}`
  const display = displayForm(keyword)
  const title =
    variant === 'missing' ? 'Click to see where to add this in your resume' : undefined

  if (variant === 'missing' && onClick) {
    return (
      <button
        type="button"
        className={className}
        title={title}
        onClick={() => onClick(keyword)}
      >
        {display}
      </button>
    )
  }

  return (
    <span className={className} title={title}>
      {display}
    </span>
  )
}
