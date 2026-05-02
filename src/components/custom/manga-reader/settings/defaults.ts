import type { KeybindAction, KeybindMap, ReaderSettings } from './types'

export const DEFAULT_KEYBINDS: KeybindMap = {
  toggleMenu: ['M'],
  turnPageRight: ['ArrowRight', 'D', 'Numpad6'],
  turnPageLeft: ['ArrowLeft', 'A', 'Numpad4'],
  scrollUp: ['W', 'Numpad8'],
  scrollDown: ['S', 'Numpad2'],
  chapterForward: ['Period'],
  chapterBackward: ['Comma'],
  toggleImmersive: ['F'],
  cycleImageFit: ['I'],
  offsetDoubleSpreads: ['O'],
}

export const KEYBIND_LABELS: Record<KeybindAction, string> = {
  toggleMenu: 'Toggle menu',
  turnPageRight: 'Turn page right',
  turnPageLeft: 'Turn page left',
  scrollUp: 'Scroll up',
  scrollDown: 'Scroll down',
  chapterForward: 'Chapter forward',
  chapterBackward: 'Chapter backward',
  toggleImmersive: 'Toggle immersive mode',
  cycleImageFit: 'Cycle image fit mode',
  offsetDoubleSpreads: 'Offset Double Spreads',
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  pageDisplay: 'single',
  readingDirection: 'ltr',
  headerVisibility: 'shown',
  progressStyle: 'normal',
  progressPosition: 'bottom',
  progressSize: 4,
  cursorHints: 'overlay',
  background: 'theme',
  imageFit: {
    containWidth: true,
    containHeight: true,
    stretchSmall: false,
    limitMaxWidth: false,
    limitMaxHeight: false,
  },
  behaviors: {
    autoAdvanceChapter: false,
    historyMode: 'page-url-stable',
    tapTurn: 'directional',
    scrollTurn: 'disabled',
    doubleClickFullscreen: false,
    autoScrollLocks: { width: true, height: true, none: true },
    autoScrollOffset: 0,
  },
  keybinds: DEFAULT_KEYBINDS,
  extras: {
    showMenuButtonWhenPinned: true,
    showPageNumberWhenHidden: false,
    greyscale: false,
    dimPages: false,
  },
}
