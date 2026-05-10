import DocBullet from './DocBullet'

type Props = {
  bullets: string[]
}

export default function DocBulletList({ bullets }: Props) {
  if (!bullets || bullets.length === 0) return null
  return (
    <ul className="doc-bullet-list">
      {bullets.map((b, i) => (
        <DocBullet key={i} source={b} />
      ))}
    </ul>
  )
}
