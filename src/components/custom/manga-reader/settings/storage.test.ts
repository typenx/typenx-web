import { describe, expect, it } from 'vitest'

import { DEFAULT_SETTINGS } from './defaults'
import { mergeSettings } from './storage'

describe('mergeSettings', () => {
  it('returns defaults when given non-object input', () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings(42)).toEqual(DEFAULT_SETTINGS)
    expect(mergeSettings('foo')).toEqual(DEFAULT_SETTINGS)
  })

  it('returns defaults for an empty object', () => {
    expect(mergeSettings({})).toEqual(DEFAULT_SETTINGS)
  })

  it('overrides top-level fields without dropping nested defaults', () => {
    const result = mergeSettings({ pageDisplay: 'double' })
    expect(result.pageDisplay).toBe('double')
    expect(result.imageFit).toEqual(DEFAULT_SETTINGS.imageFit)
    expect(result.behaviors).toEqual(DEFAULT_SETTINGS.behaviors)
  })

  it('merges nested imageFit fields without dropping siblings', () => {
    const result = mergeSettings({ imageFit: { containWidth: false } })
    expect(result.imageFit.containWidth).toBe(false)
    expect(result.imageFit.containHeight).toBe(
      DEFAULT_SETTINGS.imageFit.containHeight,
    )
  })

  it('merges deeply nested behaviors.autoScrollLocks', () => {
    const result = mergeSettings({
      behaviors: { autoScrollLocks: { width: false } },
    })
    expect(result.behaviors.autoScrollLocks.width).toBe(false)
    expect(result.behaviors.autoScrollLocks.height).toBe(true)
    expect(result.behaviors.autoScrollLocks.none).toBe(true)
    expect(result.behaviors.autoAdvanceChapter).toBe(
      DEFAULT_SETTINGS.behaviors.autoAdvanceChapter,
    )
  })

  it('ignores invalid nested values and falls back to defaults', () => {
    const result = mergeSettings({
      imageFit: 'broken',
      behaviors: { autoScrollLocks: 42 },
      keybinds: null,
      extras: 'nope',
    })
    expect(result.imageFit).toEqual(DEFAULT_SETTINGS.imageFit)
    expect(result.behaviors.autoScrollLocks).toEqual(
      DEFAULT_SETTINGS.behaviors.autoScrollLocks,
    )
    expect(result.keybinds).toEqual(DEFAULT_SETTINGS.keybinds)
    expect(result.extras).toEqual(DEFAULT_SETTINGS.extras)
  })

  it('merges custom keybinds with defaults', () => {
    const result = mergeSettings({ keybinds: { toggleMenu: ['Q'] } })
    expect(result.keybinds.toggleMenu).toEqual(['Q'])
    expect(result.keybinds.turnPageRight).toEqual(
      DEFAULT_SETTINGS.keybinds.turnPageRight,
    )
  })
})
