import * as React from 'react'

import type { PageDisplayStyle, ScrollTurnMode } from '../settings'

export function useStripScrollSync({
  containerRef,
  display,
  pageIndex,
  onPageIndexChange,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  display: PageDisplayStyle
  pageIndex: number
  onPageIndexChange: (index: number) => void
}) {
  const isStrip = display === 'long-strip' || display === 'wide-strip'

  // Scroll the active page into view when pageIndex changes externally.
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
  }, [pageIndex, isStrip, display, containerRef])

  // Detect manual scroll and update pageIndex when the user scrolls past a threshold.
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
  }, [isStrip, display, pageIndex, onPageIndexChange, containerRef])

  return { isStrip }
}

export function useWheelPageTurn({
  containerRef,
  enabled,
  onForward,
  onBackward,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  enabled: boolean
  onForward: () => void
  onBackward: () => void
}) {
  const lockRef = React.useRef(false)

  React.useEffect(() => {
    if (!enabled) return
    const node = containerRef.current
    if (!node) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return
      if (lockRef.current) return
      lockRef.current = true
      window.setTimeout(() => {
        lockRef.current = false
      }, 250)
      if (e.deltaY > 0) onForward()
      else onBackward()
    }
    node.addEventListener('wheel', onWheel, { passive: true })
    return () => node.removeEventListener('wheel', onWheel)
  }, [enabled, onForward, onBackward, containerRef])
}

export function shouldEnableWheelTurn(
  scrollTurn: ScrollTurnMode,
  display: PageDisplayStyle,
): boolean {
  if (scrollTurn === 'disabled' || scrollTurn === 'keyboard') return false
  if (display === 'long-strip' || display === 'wide-strip') return false
  return true
}
