export type HeaderChapterOption = {
  id: string
  number: number
  volume?: number | null
  title?: string | null
}

export type ReaderHeaderProps = {
  seriesTitle: string
  chapterTitle: string
  groupName?: string | null
  pageIndex: number
  pageCount: number
  onPageSelect: (index: number) => void
  chapter: HeaderChapterOption
  chapterOptions: Array<HeaderChapterOption>
  onChapterSelect: (chapter: HeaderChapterOption) => void
  onMenuClick: () => void
}
