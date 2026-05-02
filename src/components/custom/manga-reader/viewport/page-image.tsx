import { cn } from '#/lib/utils'
import { computeFitClass } from './fit'
import type { FitMode } from './fit'
import type { ImageFitSettings } from '../settings'
import type { ReaderPage } from './types'

export function PageImage({
  page,
  index,
  imageFit,
  filterClass,
  mode,
}: {
  page: ReaderPage
  index: number
  imageFit: ImageFitSettings
  filterClass: string
  mode: FitMode
}) {
  const fitClass = computeFitClass(imageFit, mode)
  return (
    <img
      data-page-index={index}
      src={page.src}
      alt={`Page ${page.number}`}
      width={page.width}
      height={page.height}
      loading={mode === 'long-strip' || mode === 'wide-strip' ? 'lazy' : 'eager'}
      decoding="async"
      draggable={false}
      className={cn(
        'block select-none object-contain',
        fitClass,
        filterClass,
      )}
    />
  )
}
