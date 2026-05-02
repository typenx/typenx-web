import * as React from 'react'

import type { ChapterSummary } from '../sidebar'
import type { PageDisplayStyle, ReadingDirection } from '../settings'

export type PageNavigationDeps = {
  pageDisplay: PageDisplayStyle
  readingDirection: ReadingDirection
  totalPages: number
  autoAdvanceChapter: boolean
  prevChapter: ChapterSummary | null
  nextChapter: ChapterSummary | null
  onSelectChapter: (chapter: ChapterSummary) => void
  setPageIndex: React.Dispatch<React.SetStateAction<number>>
}

export type PageNavigation = {
  turnPageForward: () => void
  turnPageBackward: () => void
  turnPageRight: () => void
  turnPageLeft: () => void
}

export function pageStep(display: PageDisplayStyle): number {
  return display === 'double' ? 2 : 1
}

export function computeForwardIndex({
  current,
  display,
  totalPages,
}: {
  current: number
  display: PageDisplayStyle
  totalPages: number
}): { next: number; pastEnd: boolean } {
  const step = pageStep(display)
  const next = current + step
  if (next >= totalPages) {
    return { next: Math.min(totalPages - 1, current), pastEnd: true }
  }
  return { next, pastEnd: false }
}

export function computeBackwardIndex({
  current,
  display,
}: {
  current: number
  display: PageDisplayStyle
}): { next: number; pastStart: boolean } {
  const step = pageStep(display)
  const next = current - step
  if (next < 0) {
    return { next: 0, pastStart: true }
  }
  return { next, pastStart: false }
}

export function usePageNavigation(deps: PageNavigationDeps): PageNavigation {
  const {
    pageDisplay,
    readingDirection,
    totalPages,
    autoAdvanceChapter,
    prevChapter,
    nextChapter,
    onSelectChapter,
    setPageIndex,
  } = deps

  const turnPageForward = React.useCallback(() => {
    setPageIndex((current) => {
      const result = computeForwardIndex({
        current,
        display: pageDisplay,
        totalPages,
      })
      if (result.pastEnd && autoAdvanceChapter && nextChapter) {
        onSelectChapter(nextChapter)
      }
      return result.next
    })
  }, [
    pageDisplay,
    totalPages,
    autoAdvanceChapter,
    nextChapter,
    onSelectChapter,
    setPageIndex,
  ])

  const turnPageBackward = React.useCallback(() => {
    setPageIndex((current) => {
      const result = computeBackwardIndex({ current, display: pageDisplay })
      if (result.pastStart && prevChapter) {
        onSelectChapter(prevChapter)
      }
      return result.next
    })
  }, [pageDisplay, prevChapter, onSelectChapter, setPageIndex])

  const turnPageRight = React.useCallback(() => {
    if (readingDirection === 'rtl') turnPageBackward()
    else turnPageForward()
  }, [readingDirection, turnPageForward, turnPageBackward])

  const turnPageLeft = React.useCallback(() => {
    if (readingDirection === 'rtl') turnPageForward()
    else turnPageBackward()
  }, [readingDirection, turnPageForward, turnPageBackward])

  return { turnPageForward, turnPageBackward, turnPageRight, turnPageLeft }
}
