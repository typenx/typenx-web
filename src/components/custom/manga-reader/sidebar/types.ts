import type { ReaderSettingsHandle } from '../settings'

export type ChapterSummary = {
  id: string
  number: number
  volume?: number | null
  title?: string | null
}

export type SettingsShortcut =
  | 'page-layout'
  | 'image-fit'
  | 'keybinds'
  | 'behaviors'

export type ReaderSidebarProps = {
  open: boolean
  pinned: boolean
  onPinToggle: () => void
  onClose: () => void
  seriesTitle: string
  chapterTitle: string
  pageIndex: number
  pageCount: number
  onPageChange: (index: number) => void
  chapter: ChapterSummary
  prevChapter: ChapterSummary | null
  nextChapter: ChapterSummary | null
  onChapterChange: (chapter: ChapterSummary) => void
  uploaders: Array<{ name: string; href?: string }>
  groupName?: string | null
  onReportChapter?: () => void
  onComment?: () => void
  onOpenSettings: (tab?: SettingsShortcut) => void
  handle: ReaderSettingsHandle
}
