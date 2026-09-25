import type { Orientation, Scale } from '../types'
import { OrientationSchema, ScaleSchema } from '../types'

const SCALE_KEY = 'momentum.scale'
const ORIENTATION_KEY = 'momentum.orientation'

export function loadScale(): Scale {
  try {
    const raw = localStorage.getItem(SCALE_KEY)
    const parsed = ScaleSchema.safeParse(raw)
    return parsed.success ? parsed.data : 'year'
  } catch {
    return 'year'
  }
}

export function saveScale(scale: Scale): void {
  localStorage.setItem(SCALE_KEY, scale)
}

export function loadOrientation(): Orientation {
  try {
    const raw = localStorage.getItem(ORIENTATION_KEY)
    const parsed = OrientationSchema.safeParse(raw)
    return parsed.success ? parsed.data : 'vertical'
  } catch {
    return 'vertical'
  }
}

export function saveOrientation(orientation: Orientation): void {
  localStorage.setItem(ORIENTATION_KEY, orientation)
}
