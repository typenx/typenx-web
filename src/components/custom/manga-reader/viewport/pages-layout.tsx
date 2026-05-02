import { cn } from '#/lib/utils'
import { PageImage } from './page-image'
import type {
  ImageFitSettings,
  PageDisplayStyle,
  ReadingDirection,
} from '../settings'
import type { ReaderPage } from './types'

export function PagesLayout({
  pages,
  pageIndex,
  display,
  direction,
  imageFit,
  filterClass,
  spreadOffset,
}: {
  pages: Array<ReaderPage>
  pageIndex: number
  display: PageDisplayStyle
  direction: ReadingDirection
  imageFit: ImageFitSettings
  filterClass: string
  spreadOffset: number
}) {
  if (display === 'long-strip') {
    return (
      <div className="mx-auto flex max-w-screen-md flex-col items-center gap-2 py-4">
        {pages.map((page, index) => (
          <PageImage
            key={page.number}
            page={page}
            index={index}
            imageFit={imageFit}
            filterClass={filterClass}
            mode="long-strip"
          />
        ))}
      </div>
    )
  }

  if (display === 'wide-strip') {
    return (
      <div
        className={cn(
          'flex h-full items-center gap-2 px-2',
          direction === 'rtl' && 'flex-row-reverse',
        )}
      >
        {pages.map((page, index) => (
          <PageImage
            key={page.number}
            page={page}
            index={index}
            imageFit={imageFit}
            filterClass={filterClass}
            mode="wide-strip"
          />
        ))}
      </div>
    )
  }

  if (display === 'double') {
    const offsetIndex = pageIndex + (spreadOffset % 2)
    const left = pages[offsetIndex]
    const right = pages[offsetIndex + 1]
    const orderedPages =
      direction === 'rtl'
        ? [right, left].filter((p): p is ReaderPage => Boolean(p))
        : [left, right].filter((p): p is ReaderPage => Boolean(p))
    return (
      <div className="grid h-full place-items-center px-2 py-4">
        <div className="flex h-full max-h-full items-center justify-center gap-1">
          {orderedPages.map((page) => (
            <PageImage
              key={page.number}
              page={page}
              index={pages.indexOf(page)}
              imageFit={imageFit}
              filterClass={filterClass}
              mode="single"
            />
          ))}
        </div>
      </div>
    )
  }

  const single = pages[pageIndex]
  return (
    <div className="grid h-full place-items-center px-2 py-4">
      <PageImage
        page={single}
        index={pageIndex}
        imageFit={imageFit}
        filterClass={filterClass}
        mode="single"
      />
    </div>
  )
}
