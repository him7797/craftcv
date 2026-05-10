import { renderBullet } from '@/lib/preview/bulletRenderer'

export default function DocBullet({ source }: { source: string }) {
  return <li className="doc-bullet">{renderBullet(source)}</li>
}
