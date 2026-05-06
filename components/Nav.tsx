'use client'

import { nav } from '@/lib/copy'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  const isUpload = pathname?.startsWith('/upload')

  return (
    <nav className="nav">
      <div className="logo">
        <div className="logo-icon">
          <div className="logo-pixel">
            <span /><span /><span />
            <span /><span /><span />
            <span /><span /><span />
          </div>
        </div>
        <span className="logo-text">{nav.logo.text}</span>
        <span className="logo-badge">{nav.logo.betaLabel}</span>
      </div>

      {!isUpload && (
        <div className="nav-links">
          {nav.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <div className="nav-right">
        {!isUpload && (
          <a href={nav.cta.secondaryHref} className="btn btn-w" target="_blank" rel="noopener noreferrer">
            {nav.cta.secondary}
          </a>
        )}
        <Link href={nav.cta.primaryHref} className="btn btn-y">
          {nav.cta.primary}
        </Link>
      </div>
    </nav>
  )
}
