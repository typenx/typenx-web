import * as React from 'react'
import { Menu } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { ReaderHeader } from '../header'
import { ReaderSidebar } from '../sidebar'
import { ReaderProgressBar, ReaderViewport } from '../viewport'
import { ReaderSettingsDialog } from '../settings-dialog'
import type { SettingsTab } from '../settings-dialog'
import { useReaderSettings } from '../settings'
import type { ChapterSummary } from '../sidebar'
import type { ReaderPage } from '../viewport'
import { useFullscreen } from './use-fullscreen'
import { useKeybindHandlers } from './use-keybind-handlers'
import { usePageNavigation } from './use-page-navigation'
import { nextImageFitFlags } from './image-fit-cycle'

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
  const { requestFullscreen } = useFullscreen(containerRef)

  const [pageIndex, setPageIndex] = React.useState(() =>
    Math.min(Math.max(initialPage, 0), Math.max(chapter.pages.length - 1, 0)),
  )
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarPinned, setSidebarPinned] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settingsTab, setSettingsTab] =
    React.useState<SettingsTab>('page-layout')
  const [spreadOffset, setSpreadOffset] = React.useState(0)
  const [headerHidden, setHeaderHidden] = React.useState(false)

  React.useEffect(() => {
    setPageIndex(0)
    setSpreadOffset(0)
  }, [chapter.id])

  const chapterTitle = chapter.title?.trim() || `Chapter ${chapter.number}`
  const totalPages = chapter.pages.length

  const navigation = usePageNavigation({
    pageDisplay: settings.pageDisplay,
    readingDirection: settings.readingDirection,
    totalPages,
    autoAdvanceChapter: settings.behaviors.autoAdvanceChapter,
    prevChapter: chapter.prev,
    nextChapter: chapter.next,
    onSelectChapter,
    setPageIndex,
  })

  const cycleImageFit = React.useCallback(() => {
    handle.update((prev) => ({
      ...prev,
      imageFit: { ...prev.imageFit, ...nextImageFitFlags(prev.imageFit) },
    }))
  }, [handle])

  const toggleImmersive = React.useCallback(
    () => setHeaderHidden((v) => !v),
    [],
  )
  const toggleMenu = React.useCallback(() => setSidebarOpen((v) => !v), [])
  const offsetSpread = React.useCallback(
    () => setSpreadOffset((v) => (v + 1) % 2),
    [],
  )

  const handleEscape = React.useCallback(() => {
    if (settingsOpen || sidebarOpen) {
      setSettingsOpen(false)
      if (!sidebarPinned) setSidebarOpen(false)
      return
    }
    if (onClose) onClose()
  }, [settingsOpen, sidebarOpen, sidebarPinned, onClose])

  useKeybindHandlers({
    keybinds: settings.keybinds,
    scrollTurn: settings.behaviors.scrollTurn,
    toggleMenu,
    turnPageRight: navigation.turnPageRight,
    turnPageLeft: navigation.turnPageLeft,
    turnPageForward: navigation.turnPageForward,
    turnPageBackward: navigation.turnPageBackward,
    toggleImmersive,
    cycleImageFit,
    offsetSpread,
    prevChapter: chapter.prev,
    nextChapter: chapter.next,
    onSelectChapter,
    onEscape: handleEscape,
  })

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
      className={cn('fixed inset-0 z-50 flex flex-col', containerBg)}
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
          onTapForward={navigation.turnPageForward}
          onTapBackward={navigation.turnPageBackward}
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
