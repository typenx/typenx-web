import * as React from 'react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { ReaderHeader } from './header'
import { ReaderSidebar } from './sidebar'
import {
  ReaderProgressBar,
  ReaderViewport,
} from './viewport'
import { ReaderSettingsDialog } from './settings-dialog'
import type { SettingsTab } from './settings-dialog'
import { matchesKeybind, useReaderSettings } from './settings'
import type { ChapterSummary } from './sidebar'
import type { ReaderPage } from './viewport'
import { Menu } from 'lucide-react'

export type ReaderChapter = {
  id: string
  number: number
  volume: number | null
  title: string | null
  pages: Array<ReaderPage>
  prev: ChapterSummary | null
  next: ChapterSummary | null
  chapters: Array<ChapterSummary>
}

export type ReaderProps = {
  seriesTitle: string
  groupName?: string | null
  uploaders?: Array<{ name: string; href?: string }>
  chapter: ReaderChapter
  onSelectChapter: (chapter: ChapterSummary) => void
  onClose?: () => void
  onReportChapter?: () => void
  onComment?: () => void
  initialPage?: number
}

export function MangaReader({
  seriesTitle,
  groupName,
  uploaders = [],
  chapter,
  onSelectChapter,
  onClose,
  onReportChapter,
  onComment,
  initialPage = 0,
}: ReaderProps) {
  const handle = useReaderSettings()
  const { settings } = handle

  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const [pageIndex, setPageIndex] = React.useState(() =>
    Math.min(Math.max(initialPage, 0), Math.max(chapter.pages.length - 1, 0)),
  )
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarPinned, setSidebarPinned] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settingsTab, setSettingsTab] = React.useState<SettingsTab>('page-layout')
  const [spreadOffset, setSpreadOffset] = React.useState(0)
  const [headerHidden, setHeaderHidden] = React.useState(false)

  React.useEffect(() => {
    setPageIndex(0)
    setSpreadOffset(0)
  }, [chapter.id])

  const chapterTitle =
    chapter.title?.trim() ||
    `Chapter ${chapter.number}`

  const totalPages = chapter.pages.length

  const turnPageForward = React.useCallback(() => {
    setPageIndex((current) => {
      const step = settings.pageDisplay === 'double' ? 2 : 1
      const next = current + step
      if (next >= totalPages) {
        if (settings.behaviors.autoAdvanceChapter && chapter.next) {
          onSelectChapter(chapter.next)
        }
        return Math.min(totalPages - 1, current)
      }
      return next
    })
  }, [
    settings.pageDisplay,
    settings.behaviors.autoAdvanceChapter,
    totalPages,
    chapter.next,
    onSelectChapter,
  ])

  const turnPageBackward = React.useCallback(() => {
    setPageIndex((current) => {
      const step = settings.pageDisplay === 'double' ? 2 : 1
      const next = current - step
      if (next < 0) {
        if (chapter.prev) onSelectChapter(chapter.prev)
        return 0
      }
      return next
    })
  }, [settings.pageDisplay, chapter.prev, onSelectChapter])

  const turnPageRight = React.useCallback(() => {
    if (settings.readingDirection === 'rtl') turnPageBackward()
    else turnPageForward()
  }, [settings.readingDirection, turnPageForward, turnPageBackward])

  const turnPageLeft = React.useCallback(() => {
    if (settings.readingDirection === 'rtl') turnPageForward()
    else turnPageBackward()
  }, [settings.readingDirection, turnPageForward, turnPageBackward])

  const cycleImageFit = React.useCallback(() => {
    handle.update((prev) => {
      const { containWidth, containHeight } = prev.imageFit
      let next: { containWidth: boolean; containHeight: boolean }
      if (containWidth && containHeight) next = { containWidth: true, containHeight: false }
      else if (containWidth) next = { containWidth: false, containHeight: true }
      else if (containHeight) next = { containWidth: false, containHeight: false }
      else next = { containWidth: true, containHeight: true }
      return {
        ...prev,
        imageFit: { ...prev.imageFit, ...next },
      }
    })
  }, [handle])

  const toggleImmersive = React.useCallback(() => {
    setHeaderHidden((v) => !v)
  }, [])

  const toggleMenu = React.useCallback(() => {
    setSidebarOpen((v) => !v)
  }, [])

  const requestFullscreen = React.useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement === el) {
      void document.exitFullscreen().catch(() => {})
    } else {
      void el.requestFullscreen().catch(() => {})
    }
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (matchesKeybind(e, settings.keybinds.toggleMenu)) {
        e.preventDefault()
        toggleMenu()
        return
      }
      if (matchesKeybind(e, settings.keybinds.turnPageRight)) {
        e.preventDefault()
        turnPageRight()
        return
      }
      if (matchesKeybind(e, settings.keybinds.turnPageLeft)) {
        e.preventDefault()
        turnPageLeft()
        return
      }
      if (matchesKeybind(e, settings.keybinds.scrollUp)) {
        if (settings.behaviors.scrollTurn === 'keyboard' || settings.behaviors.scrollTurn === 'both') {
          e.preventDefault()
          turnPageBackward()
        }
        return
      }
      if (matchesKeybind(e, settings.keybinds.scrollDown)) {
        if (settings.behaviors.scrollTurn === 'keyboard' || settings.behaviors.scrollTurn === 'both') {
          e.preventDefault()
          turnPageForward()
        }
        return
      }
      if (matchesKeybind(e, settings.keybinds.chapterForward)) {
        e.preventDefault()
        if (chapter.next) onSelectChapter(chapter.next)
        return
      }
      if (matchesKeybind(e, settings.keybinds.chapterBackward)) {
        e.preventDefault()
        if (chapter.prev) onSelectChapter(chapter.prev)
        return
      }
      if (matchesKeybind(e, settings.keybinds.toggleImmersive)) {
        e.preventDefault()
        toggleImmersive()
        return
      }
      if (matchesKeybind(e, settings.keybinds.cycleImageFit)) {
        e.preventDefault()
        cycleImageFit()
        return
      }
      if (matchesKeybind(e, settings.keybinds.offsetDoubleSpreads)) {
        e.preventDefault()
        setSpreadOffset((v) => (v + 1) % 2)
        return
      }
      if (e.key === 'Escape') {
        if (settingsOpen || sidebarOpen) {
          setSettingsOpen(false)
          if (!sidebarPinned) setSidebarOpen(false)
        } else if (onClose) {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    settings.keybinds,
    settings.behaviors.scrollTurn,
    turnPageRight,
    turnPageLeft,
    turnPageForward,
    turnPageBackward,
    cycleImageFit,
    toggleMenu,
    toggleImmersive,
    chapter.next,
    chapter.prev,
    onSelectChapter,
    onClose,
    settingsOpen,
    sidebarOpen,
    sidebarPinned,
  ])

  const showHeader = !headerHidden && settings.headerVisibility === 'shown'
  const renderMenuButton =
    !showHeader && settings.extras.showMenuButtonWhenPinned

  const openSettings = React.useCallback((tab: SettingsTab = 'page-layout') => {
    setSettingsTab(tab)
    setSettingsOpen(true)
  }, [])

  const containerBg =
    settings.background === 'white'
      ? 'bg-white text-black'
      : settings.background === 'black'
        ? 'bg-black text-white'
        : 'bg-background text-foreground'

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-50 flex flex-col',
        containerBg,
      )}
    >
      {showHeader && (
        <ReaderHeader
          seriesTitle={seriesTitle}
          chapterTitle={chapterTitle}
          groupName={groupName}
          pageIndex={pageIndex}
          pageCount={totalPages}
          onPageSelect={setPageIndex}
          chapter={chapter}
          chapterOptions={chapter.chapters}
          onChapterSelect={onSelectChapter}
          onMenuClick={toggleMenu}
        />
      )}

      <div className="relative flex flex-1 overflow-hidden">
        <ReaderViewport
          pages={chapter.pages}
          pageIndex={pageIndex}
          onPageIndexChange={setPageIndex}
          display={settings.pageDisplay}
          direction={settings.readingDirection}
          imageFit={settings.imageFit}
          extras={settings.extras}
          spreadOffset={spreadOffset}
          onSpreadOffsetChange={setSpreadOffset}
          onTapForward={turnPageForward}
          onTapBackward={turnPageBackward}
          onTapToggleMenu={toggleMenu}
          tapMode={settings.behaviors.tapTurn}
          scrollTurn={settings.behaviors.scrollTurn}
          doubleClickFullscreen={settings.behaviors.doubleClickFullscreen}
          onRequestFullscreen={requestFullscreen}
          cursorHints={settings.cursorHints}
          background={settings.background}
        />

        <ReaderProgressBar
          pageIndex={pageIndex}
          pageCount={totalPages}
          style={settings.progressStyle}
          position={settings.progressPosition}
          size={settings.progressSize}
          onJump={setPageIndex}
        />

        <ReaderSidebar
          open={sidebarOpen}
          pinned={sidebarPinned}
          onPinToggle={() => setSidebarPinned((v) => !v)}
          onClose={() => setSidebarOpen(false)}
          seriesTitle={seriesTitle}
          chapterTitle={chapterTitle}
          pageIndex={pageIndex}
          pageCount={totalPages}
          onPageChange={setPageIndex}
          chapter={chapter}
          prevChapter={chapter.prev}
          nextChapter={chapter.next}
          onChapterChange={onSelectChapter}
          uploaders={uploaders}
          groupName={groupName}
          onReportChapter={onReportChapter}
          onComment={onComment}
          onOpenSettings={openSettings}
          handle={handle}
        />
      </div>

      {!showHeader && settings.extras.showPageNumberWhenHidden && (
        <div className="pointer-events-none absolute right-4 top-4 z-30 rounded-md bg-foreground/10 px-2 py-1 text-xs text-foreground/80 backdrop-blur">
          {pageIndex + 1} / {totalPages}
        </div>
      )}

      {renderMenuButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-4 z-30"
          aria-label="Open menu"
          onClick={toggleMenu}
        >
          <Menu />
        </Button>
      )}

      <ReaderSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab={settingsTab}
        handle={handle}
      />
    </div>
  )
}
