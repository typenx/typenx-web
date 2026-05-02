import type {
  CursorActionHints,
  ImageFitSettings,
  PageDisplayStyle,
  ReaderBackground,
  ReaderExtras,
  ReadingDirection,
  ScrollTurnMode,
  TapTurnMode,
} from '../settings'

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
  tapMode: TapTurnMode
  scrollTurn: ScrollTurnMode
  doubleClickFullscreen: boolean
  onRequestFullscreen: () => void
  cursorHints: CursorActionHints
  background: ReaderBackground
}
