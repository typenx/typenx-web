import type { ImageFitSettings } from '../settings'

export function nextImageFitFlags(
  fit: Pick<ImageFitSettings, 'containWidth' | 'containHeight'>,
): { containWidth: boolean; containHeight: boolean } {
  if (fit.containWidth && fit.containHeight) {
    return { containWidth: true, containHeight: false }
  }
  if (fit.containWidth) {
    return { containWidth: false, containHeight: true }
  }
  if (fit.containHeight) {
    return { containWidth: false, containHeight: false }
  }
  return { containWidth: true, containHeight: true }
}
