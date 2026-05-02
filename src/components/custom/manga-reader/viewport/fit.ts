import type { ImageFitSettings } from '../settings'

export type FitMode = 'single' | 'long-strip' | 'wide-strip'

export function computeFitClass(
  fit: ImageFitSettings,
  mode: FitMode,
): string {
  const classes: Array<string> = []
  if (mode === 'long-strip') {
    if (fit.containWidth) classes.push('w-full')
    if (fit.stretchSmall) classes.push('min-w-full')
    if (fit.limitMaxWidth) classes.push('max-w-screen-md')
    return classes.join(' ')
  }
  if (mode === 'wide-strip') {
    if (fit.containHeight) classes.push('h-full')
    if (fit.stretchSmall) classes.push('min-h-full')
    if (fit.limitMaxHeight) classes.push('max-h-screen')
    return classes.join(' ')
  }
  if (fit.containWidth && fit.containHeight) {
    classes.push('max-h-full max-w-full')
  } else if (fit.containWidth) {
    classes.push('w-full h-auto')
  } else if (fit.containHeight) {
    classes.push('h-full w-auto')
  }
  if (fit.stretchSmall) classes.push('min-w-[40vw] min-h-[60vh]')
  if (fit.limitMaxWidth) classes.push('max-w-[1200px]')
  if (fit.limitMaxHeight) classes.push('max-h-[1600px]')
  return classes.join(' ')
}
