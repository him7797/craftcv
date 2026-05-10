import { Fragment, type ReactNode } from 'react'
import { tokenize } from '@/lib/editor/bulletParser'

/**
 * Render a bullet's source markup to Preview-flavored React.
 *   {{m:value}} → <strong>value</strong>     (metric — bold black)
 *   {{t:value}} → <strong>value</strong>     (tech — bold black)
 *   {{i:value}} → "(value)"                  (italic markup stripped, parens added)
 *   plain text  → text node
 *
 * Differs intentionally from the editor's renderer: Preview shows the document
 * as the recruiter sees it — no yellow highlights anywhere.
 */
export function renderBullet(source: string): ReactNode {
  const tokens = tokenize(source)
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.kind === 'text') return <Fragment key={i}>{tok.value}</Fragment>
        if (tok.kind === 'metric' || tok.kind === 'tech') {
          return <strong key={i}>{tok.value}</strong>
        }
        // italic — strip the markup, wrap value in parentheses
        return <Fragment key={i}>({tok.value})</Fragment>
      })}
    </>
  )
}
