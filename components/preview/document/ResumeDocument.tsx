'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { usePreviewStore } from '@/lib/store/usePreviewStore'
import { measurePages } from '@/lib/preview/measurePages'
import DocumentPage from './DocumentPage'
import DocHeader from './sections/DocHeader'
import DocExperience from './sections/DocExperience'
import DocSkills from './sections/DocSkills'
import DocEducation from './sections/DocEducation'
import DocProjects from './sections/DocProjects'

export default function ResumeDocument() {
  const activeVersionId = useStore((s) => s.editor.activeVersionId)
  const versions = useStore((s) => s.versions)
  const setMeasurement = usePreviewStore((s) => s.setMeasurement)

  const innerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeVersion = versions[activeVersionId]
  const resume = activeVersion?.resume

  useEffect(() => {
    const node = innerRef.current
    if (!node) return

    function recompute() {
      if (!innerRef.current) return
      const height = innerRef.current.getBoundingClientRect().height
      setMeasurement(measurePages(height))
    }

    function schedule() {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(recompute, 100)
    }

    schedule()

    const observer = new ResizeObserver(schedule)
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [resume, setMeasurement])

  if (!resume) return null

  return (
    <DocumentPage>
      <div ref={innerRef}>
        <DocHeader header={resume.header} />
        <DocExperience experience={resume.experience} />
        <DocSkills skills={resume.skills} />
        <DocEducation education={resume.education} />
        <DocProjects projects={resume.projects} />
      </div>
    </DocumentPage>
  )
}
