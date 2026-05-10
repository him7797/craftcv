type Props = {
  category: string
  items: string[]
}

export default function DocSkillCategory({ category, items }: Props) {
  return (
    <div>
      <div className="doc-skill-cat-label">{category.toUpperCase()}</div>
      <div className="doc-skill-cat-items">{items.join(', ')}</div>
    </div>
  )
}
