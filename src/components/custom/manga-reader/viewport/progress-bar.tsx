import * as React from 'react'

import { cn } from '#/lib/utils'
import type {
  ProgressBarPosition,
  ProgressBarStyle,
} from '../settings'

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
  const trackBg = style === 'lightbar' ? 'bg-foreground/5' : 'bg-foreground/15'

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
