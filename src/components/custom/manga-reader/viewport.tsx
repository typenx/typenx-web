import * as React from 'react'

import { cn } from '#/lib/utils'
import type {
  ImageFitSettings,
  PageDisplayStyle,
  ProgressBarPosition,
  ProgressBarStyle,
  ReaderExtras,
  ReadingDirection,
} from './settings'

export type ReaderPage = {
  number: number
  src: string
  width?: number
  height?: number
}

export type ReaderViewportProps = {
  pages: Array<ReaderPage>
  pageIndex: number
  onPageIndexChange: (index: number) => void
  display: PageDisplayStyle
  direction: ReadingDirection
  imageFit: ImageFitSettings
  extras: ReaderExtras
  spreadOffset: number
  onSpreadOffsetChange: (offset: number) => void
  onTapForward: () => void
  onTapBackward: () => void
  onTapToggleMenu: () => void
  tapMode: 'directional' | 'always-forward' | 'never'
  scrollTurn: 'disabled' | 'mouse-wheel' | 'keyboard' | 'both'
  doubleClickFullscreen: boolean
  onRequestFullscreen: () => void
  cursorHints: 'none' | 'overlay' | 'cursor'
  background: 'theme' | 'white' | 'black'
}

export function ReaderViewport({
  pages,
  pageIndex,
  onPageIndexChange,
  display,
  direction,
  imageFit,
  extras,
  spreadOffset,
  onSpreadOffsetChange: _onSpreadOffsetChange,
  onTapForward,
  onTapBackward,
  onTapToggleMenu,
  tapMode,
  scrollTurn,
  doubleClickFullscreen,
  onRequestFullscreen,
  cursorHints,
  background,
}: ReaderViewportProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const stripWheelLockRef = React.useRef(false)

  const isStrip = display === 'long-strip' || display === 'wide-strip'

  React.useEffect(() => {
    if (!isStrip) return
    const node = containerRef.current
    if (!node) return
    const el = node.querySelector<HTMLElement>(
      `[data-page-index="${pageIndex}"]`,
    )
    if (!el) return
    if (display === 'long-strip') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      el.scrollIntoView({ behavior: 'smooth', inline: 'start' })
    }
  }, [pageIndex, isStrip, pages, display])

  React.useEffect(() => {
    if (scrollTurn === 'disabled' || scrollTurn === 'keyboard') return
    if (isStrip) return
    const node = containerRef.current
    if (!node) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return
      if (stripWheelLockRef.current) return
      stripWheelLockRef.current = true
      window.setTimeout(() => {
        stripWheelLockRef.current = false
      }, 250)
      if (e.deltaY > 0) onTapForward()
      else onTapBackward()
    }
    node.addEventListener('wheel', onWheel, { passive: true })
    return () => node.removeEventListener('wheel', onWheel)
  }, [scrollTurn, isStrip, onTapForward, onTapBackward])

  React.useEffect(() => {
    if (!isStrip) return
    const node = containerRef.current
    if (!node) return
    let pending = false
    const onScroll = () => {
      if (pending) return
      pending = true
      window.requestAnimationFrame(() => {
        pending = false
        const elements = Array.from(
          node.querySelectorAll<HTMLElement>('[data-page-index]'),
        )
        let nextIndex = pageIndex
        if (display === 'long-strip') {
          const top = node.scrollTop + 64
          for (const el of elements) {
            if (el.offsetTop <= top) {
              nextIndex = Number(el.dataset.pageIndex)
            } else {
              break
            }
          }
        } else {
          const left = node.scrollLeft + 64
          for (const el of elements) {
            if (el.offsetLeft <= left) {
              nextIndex = Number(el.dataset.pageIndex)
            } else {
              break
            }
          }
        }
        if (nextIndex !== pageIndex) onPageIndexChange(nextIndex)
      })
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    return () => node.removeEventListener('scroll', onScroll)
  }, [isStrip, display, pageIndex, onPageIndexChange])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tapMode === 'never') {
      onTapToggleMenu()
      return
    }
    if (isStrip) {
      onTapToggleMenu()
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const third = rect.width / 3
    if (tapMode === 'always-forward') {
      if (x < third) {
        onTapToggleMenu()
      } else {
        onTapForward()
      }
      return
    }
    // directional
    if (x < third) {
      direction === 'rtl' ? onTapForward() : onTapBackward()
    } else if (x > rect.width - third) {
      direction === 'rtl' ? onTapBackward() : onTapForward()
    } else {
      onTapToggleMenu()
    }
  }

  const handleDoubleClick = () => {
    if (doubleClickFullscreen) onRequestFullscreen()
  }

  const bgClass =
    background === 'white'
      ? 'bg-white text-black'
      : background === 'black'
        ? 'bg-black text-white'
        : 'bg-background'

  const filterClass = cn(
    extras.greyscale && 'grayscale',
    extras.dimPages && 'brightness-75',
  )

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-cursor={cursorHints}
      className={cn(
        'relative flex-1 overflow-auto',
        bgClass,
        cursorHints === 'cursor' && 'cursor-pointer',
        display === 'wide-strip' && 'overflow-y-hidden overflow-x-auto',
      )}
    >
      <PagesLayout
        pages={pages}
        pageIndex={pageIndex}
        display={display}
        direction={direction}
        imageFit={imageFit}
        filterClass={filterClass}
        spreadOffset={spreadOffset}
      />
      {cursorHints === 'overlay' && !isStrip && tapMode !== 'never' && (
        <CursorHintsOverlay tapMode={tapMode} direction={direction} />
      )}
    </div>
  )
}

function PagesLayout({
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

function PageImage({
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
  mode: 'single' | 'long-strip' | 'wide-strip'
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

function computeFitClass(
  fit: ImageFitSettings,
  mode: 'single' | 'long-strip' | 'wide-strip',
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

function CursorHintsOverlay({
  tapMode,
  direction,
}: {
  tapMode: 'directional' | 'always-forward'
  direction: ReadingDirection
}) {
  if (tapMode === 'always-forward') {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex"
      >
        <div className="flex-1 ring-1 ring-foreground/0" />
        <div className="flex-2 bg-foreground/[0.03] ring-1 ring-foreground/10" />
      </div>
    )
  }
  const back = direction === 'rtl' ? 'right' : 'left'
  const fwd = direction === 'rtl' ? 'left' : 'right'
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex"
      data-fwd={fwd}
      data-back={back}
    >
      <div className="flex-1 bg-foreground/[0.04] ring-1 ring-foreground/10" />
      <div className="flex-1" />
      <div className="flex-1 bg-foreground/[0.04] ring-1 ring-foreground/10" />
    </div>
  )
}

export function ReaderProgressBar({
  pageIndex,
  pageCount,
  style,
  position,
  size,
  onJump,
}: {
  pageIndex: number
  pageCount: number
  style: ProgressBarStyle
  position: ProgressBarPosition
  size: number
  onJump?: (index: number) => void
}) {
  if (style === 'hidden') return null
  const pct = pageCount > 0 ? ((pageIndex + 1) / pageCount) * 100 : 0
  const trackThickness = `${size}px`

  if (position === 'left' || position === 'right') {
    return (
      <div
        className={cn(
          'pointer-events-auto absolute top-0 z-30 flex h-full',
          position === 'left' ? 'left-0' : 'right-0',
        )}
        style={{ width: trackThickness }}
      >
        <ProgressTrack
          orientation="vertical"
          pct={pct}
          style={style}
          pageIndex={pageIndex}
          pageCount={pageCount}
          onJump={onJump}
        />
      </div>
    )
  }
  return (
    <div
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-30"
      style={{ height: trackThickness }}
    >
      <ProgressTrack
        orientation="horizontal"
        pct={pct}
        style={style}
        pageIndex={pageIndex}
        pageCount={pageCount}
        onJump={onJump}
      />
    </div>
  )
}

function ProgressTrack({
  orientation,
  pct,
  style,
  pageIndex,
  pageCount,
  onJump,
}: {
  orientation: 'horizontal' | 'vertical'
  pct: number
  style: ProgressBarStyle
  pageIndex: number
  pageCount: number
  onJump?: (index: number) => void
}) {
  const accent = style === 'lightbar' ? 'bg-foreground/40' : 'bg-primary'
  const trackBg =
    style === 'lightbar' ? 'bg-foreground/5' : 'bg-foreground/15'

  const handleJump = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onJump || pageCount <= 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio =
      orientation === 'horizontal'
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height
    const target = Math.min(
      pageCount - 1,
      Math.max(0, Math.round(ratio * pageCount)),
    )
    onJump(target)
  }

  return (
    <div
      className={cn('relative h-full w-full cursor-pointer', trackBg)}
      onClick={handleJump}
      role="progressbar"
      aria-valuenow={pageIndex + 1}
      aria-valuemin={1}
      aria-valuemax={pageCount}
      aria-label="Reader progress"
    >
      <div
        className={cn('absolute inset-y-0 left-0', accent)}
        style={
          orientation === 'horizontal'
            ? { width: `${pct}%` }
            : { width: '100%', height: `${pct}%`, top: 0 }
        }
      />
    </div>
  )
}
