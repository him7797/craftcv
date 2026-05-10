'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTailorStore } from '@/lib/store/useTailorStore'
import TopNav from './TopNav'
import StatusBar from './StatusBar'
import JdInputColumn from './jdInput/JdInputColumn'
import OutputColumn from './output/OutputColumn'

export default function TailorShell() {
  const router = useRouter()
  const [saveModalOpen, setSaveModalOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey

      // Don't fire global shortcuts while typing in input/textarea (except for Esc).
      const target = e.target as HTMLElement | null
      const inEditableField =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')

      if (meta && e.key.toLowerCase() === 'e' && !inEditableField) {
        e.preventDefault()
        router.push('/editor')
        return
      }

      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault()
        setSaveModalOpen(true)
        return
      }

      if (meta && (e.key === '1' || e.key === '2' || e.key === '3')) {
        const idx = parseInt(e.key, 10) - 1
        const profiles = useTailorStore.getState().profiles
        const target = profiles[idx]
        if (target) {
          e.preventDefault()
          useTailorStore.getState().loadProfile(target.id)
        }
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <div className="tailor-shell">
      <TopNav />
      <div className="tailor-cols">
        <section className="tailor-col" aria-label="JD input">
          <div className="tailor-side-h">JOB DESCRIPTION</div>
          <JdInputColumn
            saveModalOpen={saveModalOpen}
            setSaveModalOpen={setSaveModalOpen}
          />
        </section>
        <div className="tailor-divider" aria-hidden />
        <section className="tailor-col" aria-label="Analysis output">
          <OutputColumn />
        </section>
      </div>
      <StatusBar />
    </div>
  )
}
