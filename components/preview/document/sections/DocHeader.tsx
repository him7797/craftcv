import type { Resume } from '@/lib/types'

type Props = {
  header: Resume['header']
}

export default function DocHeader({ header }: Props) {
  const items: React.ReactNode[] = []

  if (header.location) {
    items.push(
      <span key="loc" className="doc-contact-item">
        {header.location}
      </span>,
    )
  }

  if (header.email) {
    items.push(
      <a key="email" href={`mailto:${header.email}`}>
        {header.email}
      </a>,
    )
  }

  if (header.links) {
    for (const link of header.links) {
      if (!link.label && !link.url) continue
      if (link.url) {
        items.push(
          <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label || link.url}
          </a>,
        )
      } else {
        items.push(
          <span key={link.label} className="doc-contact-item">
            {link.label}
          </span>,
        )
      }
    }
  }

  return (
    <header>
      <h1 className="doc-name">{header.name}</h1>
      {items.length > 0 && (
        <div className="doc-contact">
          {items.map((node, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {node}
              {i < items.length - 1 && <span className="sep">·</span>}
            </span>
          ))}
        </div>
      )}
      <hr className="doc-divider" />
    </header>
  )
}
