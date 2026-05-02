import * as React from 'react'

import { DEFAULT_KEYBINDS, DEFAULT_SETTINGS } from './defaults'
import { readStoredSettings, writeStoredSettings } from './storage'
import type {
  BehaviorSettings,
  ImageFitSettings,
  KeybindAction,
  ReaderExtras,
  ReaderSettings,
  ReaderSettingsHandle,
  ReaderSettingsUpdater,
} from './types'

export function useReaderSettings(): ReaderSettingsHandle {
  const [settings, setSettings] = React.useState<ReaderSettings>(
    () => DEFAULT_SETTINGS,
  )
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setSettings(readStoredSettings())
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    writeStoredSettings(settings)
  }, [settings, hydrated])

  const update = React.useCallback((updater: ReaderSettingsUpdater) => {
    setSettings((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater },
    )
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
