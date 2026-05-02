export type PageDisplayStyle = 'single' | 'double' | 'long-strip' | 'wide-strip'
export type ReadingDirection = 'ltr' | 'rtl'
export type HeaderVisibility = 'hidden' | 'shown'
export type ProgressBarStyle = 'hidden' | 'lightbar' | 'normal'
export type ProgressBarPosition = 'bottom' | 'left' | 'right'
export type CursorActionHints = 'none' | 'overlay' | 'cursor'
export type ReaderBackground = 'theme' | 'white' | 'black'
export type HistoryMode =
  | 'page-url-stable'
  | 'page-url-updates'
  | 'page-url-updates-history'
export type TapTurnMode = 'directional' | 'always-forward' | 'never'
export type ScrollTurnMode = 'disabled' | 'mouse-wheel' | 'keyboard' | 'both'

export type ImageFitSettings = {
  containWidth: boolean
  containHeight: boolean
  stretchSmall: boolean
  limitMaxWidth: boolean
  limitMaxHeight: boolean
}

export type AutoScrollLocks = {
  width: boolean
  height: boolean
  none: boolean
}

export type BehaviorSettings = {
  autoAdvanceChapter: boolean
  historyMode: HistoryMode
  tapTurn: TapTurnMode
  scrollTurn: ScrollTurnMode
  doubleClickFullscreen: boolean
  autoScrollLocks: AutoScrollLocks
  autoScrollOffset: number
}

export type KeybindAction =
  | 'toggleMenu'
  | 'turnPageRight'
  | 'turnPageLeft'
  | 'scrollUp'
  | 'scrollDown'
  | 'chapterForward'
  | 'chapterBackward'
  | 'toggleImmersive'
  | 'cycleImageFit'
  | 'offsetDoubleSpreads'

export type KeybindMap = Record<KeybindAction, Array<string>>

export type ReaderExtras = {
  showMenuButtonWhenPinned: boolean
  showPageNumberWhenHidden: boolean
  greyscale: boolean
  dimPages: boolean
}

export type ReaderSettings = {
  pageDisplay: PageDisplayStyle
  readingDirection: ReadingDirection
  headerVisibility: HeaderVisibility
  progressStyle: ProgressBarStyle
  progressPosition: ProgressBarPosition
  progressSize: number
  cursorHints: CursorActionHints
  background: ReaderBackground
  imageFit: ImageFitSettings
  behaviors: BehaviorSettings
  keybinds: KeybindMap
  extras: ReaderExtras
}

export type ReaderSettingsUpdater =
  | Partial<ReaderSettings>
  | ((prev: ReaderSettings) => ReaderSettings)

export type ReaderSettingsHandle = {
  settings: ReaderSettings
  update: (updater: ReaderSettingsUpdater) => void
  patchImageFit: (patch: Partial<ImageFitSettings>) => void
  patchBehaviors: (patch: Partial<BehaviorSettings>) => void
  patchExtras: (patch: Partial<ReaderExtras>) => void
  setKeybind: (action: KeybindAction, keys: Array<string>) => void
  resetKeybinds: () => void
  resetKeybindsForAction: (action: KeybindAction) => void
}
