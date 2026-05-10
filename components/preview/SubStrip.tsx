'use client'

import ContextInfo from './ContextInfo'
import VersionChips from './VersionChips'

export default function SubStrip() {
  return (
    <div className="preview-substrip">
      <ContextInfo />
      <div className="preview-substrip-right">
        <span className="preview-substrip-label">SHOWING AS PDF</span>
        <div className="preview-chips">
          <VersionChips />
        </div>
      </div>
    </div>
  )
}
