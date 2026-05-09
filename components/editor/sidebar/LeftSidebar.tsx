'use client'

import NewVersionButton from './NewVersionButton'
import SectionList from './SectionList'
import VersionList from './VersionList'

export default function LeftSidebar() {
  return (
    <aside className="editor-sidebar-l">
      <SectionList />
      <VersionList />
      <NewVersionButton />
    </aside>
  )
}
