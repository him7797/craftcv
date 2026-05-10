'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import TopNav from './TopNav'
import SubStrip from './SubStrip'
import StatusBar from './StatusBar'
import ResumeDocument from './document/ResumeDocument'

export default function PreviewShell() {
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey

      const target = e.target as HTMLElement | null
      const inEditableField =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      if (inEditableField) return

      if (meta && (e.key.toLowerCase() === 'e' || e.key === 'ArrowLeft')) {
        e.preventDefault()
        router.push('/editor')
        return
      }

      if (meta && (e.key === '1' || e.key === '2' || e.key === '3')) {
        const idx = parseInt(e.key, 10) - 1
        const versions = Object.values(useStore.getState().versions)
        const sorted = [...versions].sort((a, b) => {
          if (a.id === 'master') return -1
          if (b.id === 'master') return 1
          return a.createdAt.localeCompare(b.createdAt)
        })
        const target = sorted[idx]
        if (target) {
          e.preventDefault()
          useStore.getState().switchVersion(target.id)
        }
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  return (
    <div className="preview-shell">
      <TopNav />
      <SubStrip />
      <main className="preview-canvas">
        <ResumeDocument />
      </main>
      <StatusBar />
    </div>
  )
}
