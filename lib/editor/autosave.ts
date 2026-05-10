import type { PersistedSnapshot } from '@/lib/types'

const KEY = 'craftcv:resume:v1'

export function loadSnapshot(): PersistedSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedSnapshot>
    if (parsed.schemaVersion !== 1) return null
    if (!parsed.activeVersionId || !parsed.versions) return null
    return parsed as PersistedSnapshot
  } catch {
    return null
  }
}

export function saveSnapshot(snapshot: PersistedSnapshot): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}

export function clearSnapshot(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleSave(snapshot: PersistedSnapshot, delayMs = 500): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveSnapshot(snapshot)
    saveTimer = null
  }, delayMs)
}

export function flushSave(snapshot: PersistedSnapshot): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
  saveSnapshot(snapshot)
}
