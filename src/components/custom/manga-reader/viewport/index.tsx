import * as React from 'react'

import { cn } from '#/lib/utils'
import { CursorHintsOverlay } from './cursor-hints'
import { PagesLayout } from './pages-layout'
import {
  shouldEnableWheelTurn,
  useStripScrollSync,
  useWheelPageTurn,
} from './hooks'
import type { ReaderViewportProps } from './types'

export type { ReaderPage, ReaderViewportProps } from './types'
export { ReaderProgressBar } from './progress-bar'

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
  const { isStrip } = useStripScrollSync({
    containerRef,
    display,
    pageIndex,
    onPageIndexChange,
  })

  useWheelPageTurn({
    containerRef,
    enabled: shouldEnableWheelTurn(scrollTurn, display),
    onForward: onTapForward,
    onBackward: onTapBackward,
  })

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
      if (x < third) onTapToggleMenu()
      else onTapForward()
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
