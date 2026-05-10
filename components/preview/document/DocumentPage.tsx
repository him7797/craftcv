import type { ReactNode } from 'react'

export default function DocumentPage({ children }: { children: ReactNode }) {
  return <article className="doc-page doc-page-shadow">{children}</article>
}
