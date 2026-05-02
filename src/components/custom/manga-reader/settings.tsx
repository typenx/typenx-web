import * as React from 'react'

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

const STORAGE_KEY = 'typenx-manga-reader-settings'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function mergeSettings(stored: unknown): ReaderSettings {
  if (!isObject(stored)) return DEFAULT_SETTINGS
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    imageFit: {
      ...DEFAULT_SETTINGS.imageFit,
      ...(isObject(stored.imageFit) ? stored.imageFit : {}),
    },
    behaviors: {
      ...DEFAULT_SETTINGS.behaviors,
      ...(isObject(stored.behaviors) ? stored.behaviors : {}),
      autoScrollLocks: {
        ...DEFAULT_SETTINGS.behaviors.autoScrollLocks,
        ...(isObject(stored.behaviors) &&
        isObject(stored.behaviors.autoScrollLocks)
          ? stored.behaviors.autoScrollLocks
          : {}),
      },
    },
    keybinds: {
      ...DEFAULT_SETTINGS.keybinds,
      ...(isObject(stored.keybinds) ? stored.keybinds : {}),
    },
    extras: {
      ...DEFAULT_SETTINGS.extras,
      ...(isObject(stored.extras) ? stored.extras : {}),
    },
  }
}

function readStored(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return mergeSettings(JSON.parse(raw))
  } catch {
    return DEFAULT_SETTINGS
  }
}

function writeStored(settings: ReaderSettings) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* swallow quota/serialize errors */
  }
}

type Updater =
  | Partial<ReaderSettings>
  | ((prev: ReaderSettings) => ReaderSettings)

export type ReaderSettingsHandle = {
  settings: ReaderSettings
  update: (updater: Updater) => void
  patchImageFit: (patch: Partial<ImageFitSettings>) => void
  patchBehaviors: (patch: Partial<BehaviorSettings>) => void
  patchExtras: (patch: Partial<ReaderExtras>) => void
  setKeybind: (action: KeybindAction, keys: Array<string>) => void
  resetKeybinds: () => void
  resetKeybindsForAction: (action: KeybindAction) => void
}

export function useReaderSettings(): ReaderSettingsHandle {
  const [settings, setSettings] = React.useState<ReaderSettings>(
    () => DEFAULT_SETTINGS,
  )
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setSettings(readStored())
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    writeStored(settings)
  }, [settings, hydrated])

  const update = React.useCallback((updater: Updater) => {
    setSettings((prev) => {
      const next =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  const patchImageFit = React.useCallback(
    (patch: Partial<ImageFitSettings>) => {
      setSettings((prev) => ({
        ...prev,
        imageFit: { ...prev.imageFit, ...patch },
      }))
    },
    [],
  )

  const patchBehaviors = React.useCallback(
    (patch: Partial<BehaviorSettings>) => {
      setSettings((prev) => ({
        ...prev,
        behaviors: { ...prev.behaviors, ...patch },
      }))
    },
    [],
  )

  const patchExtras = React.useCallback((patch: Partial<ReaderExtras>) => {
    setSettings((prev) => ({
      ...prev,
      extras: { ...prev.extras, ...patch },
    }))
  }, [])

  const setKeybind = React.useCallback(
    (action: KeybindAction, keys: Array<string>) => {
      setSettings((prev) => ({
        ...prev,
        keybinds: { ...prev.keybinds, [action]: keys },
      }))
    },
    [],
  )

  const resetKeybinds = React.useCallback(() => {
    setSettings((prev) => ({ ...prev, keybinds: DEFAULT_KEYBINDS }))
  }, [])

  const resetKeybindsForAction = React.useCallback((action: KeybindAction) => {
    setSettings((prev) => ({
      ...prev,
      keybinds: { ...prev.keybinds, [action]: DEFAULT_KEYBINDS[action] },
    }))
  }, [])

  return {
    settings,
    update,
    patchImageFit,
    patchBehaviors,
    patchExtras,
    setKeybind,
    resetKeybinds,
    resetKeybindsForAction,
  }
}

export function formatKeyLabel(key: string): string {
  if (key.startsWith('Numpad')) return `Num ${key.slice(6)}`
  if (key === 'ArrowLeft') return 'Left Arrow'
  if (key === 'ArrowRight') return 'Right Arrow'
  if (key === 'ArrowUp') return 'Up Arrow'
  if (key === 'ArrowDown') return 'Down Arrow'
  if (key === 'Period') return 'Period'
  if (key === 'Comma') return 'Comma'
  if (key === ' ') return 'Space'
  if (key.length === 1) return key.toUpperCase()
  return key
}

export function eventToKeybindKey(e: KeyboardEvent): string | null {
  if (e.key.startsWith('Arrow')) return e.key
  if (e.code.startsWith('Numpad')) return e.code
  if (e.code === 'Period' || e.code === 'Comma' || e.code === 'Space') {
    return e.code
  }
  if (e.key === ' ') return 'Space'
  if (e.key.length === 1) return e.key.toUpperCase()
  return e.key
}

export function matchesKeybind(
  e: KeyboardEvent,
  bindings: Array<string>,
): boolean {
  const key = eventToKeybindKey(e)
  if (!key) return false
  return bindings.some((b) => b === key || b.toUpperCase() === key.toUpperCase())
}
