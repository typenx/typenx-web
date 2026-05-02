import { DEFAULT_SETTINGS } from './defaults'
import type { ReaderSettings } from './types'

export const STORAGE_KEY = 'typenx-manga-reader-settings'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function mergeSettings(stored: unknown): ReaderSettings {
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

export function readStoredSettings(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return mergeSettings(JSON.parse(raw))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function writeStoredSettings(settings: ReaderSettings) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* swallow quota/serialize errors */
  }
}
