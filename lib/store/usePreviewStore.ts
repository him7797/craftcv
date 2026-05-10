import { create } from 'zustand'
import type { PageMeasurement } from '@/lib/types'

export interface PreviewStore {
  measurement: PageMeasurement | null
  setMeasurement: (m: PageMeasurement) => void
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  measurement: null,
  setMeasurement: (m) => set({ measurement: m }),
}))
