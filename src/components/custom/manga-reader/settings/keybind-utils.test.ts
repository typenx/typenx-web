import { describe, expect, it } from 'vitest'

import {
  eventToKeybindKey,
  formatKeyLabel,
  matchesKeybind,
} from './keybind-utils'

describe('formatKeyLabel', () => {
  it('renames numpad keys with friendly prefix', () => {
    expect(formatKeyLabel('Numpad4')).toBe('Num 4')
    expect(formatKeyLabel('Numpad8')).toBe('Num 8')
  })

  it('renames arrow keys', () => {
    expect(formatKeyLabel('ArrowLeft')).toBe('Left Arrow')
    expect(formatKeyLabel('ArrowRight')).toBe('Right Arrow')
    expect(formatKeyLabel('ArrowUp')).toBe('Up Arrow')
    expect(formatKeyLabel('ArrowDown')).toBe('Down Arrow')
  })

  it('renames symbolic keys', () => {
    expect(formatKeyLabel('Period')).toBe('Period')
    expect(formatKeyLabel('Comma')).toBe('Comma')
    expect(formatKeyLabel(' ')).toBe('Space')
  })

  it('uppercases single character keys', () => {
    expect(formatKeyLabel('a')).toBe('A')
    expect(formatKeyLabel('m')).toBe('M')
  })

  it('passes through multi-char keys unchanged', () => {
    expect(formatKeyLabel('Escape')).toBe('Escape')
  })
})

describe('eventToKeybindKey', () => {
  it('returns Arrow* keys verbatim', () => {
    expect(eventToKeybindKey({ key: 'ArrowLeft', code: 'ArrowLeft' })).toBe(
      'ArrowLeft',
    )
  })

  it('returns Numpad code for numpad presses', () => {
    expect(eventToKeybindKey({ key: '4', code: 'Numpad4' })).toBe('Numpad4')
  })

  it('returns code for Period/Comma/Space', () => {
    expect(eventToKeybindKey({ key: '.', code: 'Period' })).toBe('Period')
    expect(eventToKeybindKey({ key: ',', code: 'Comma' })).toBe('Comma')
    expect(eventToKeybindKey({ key: ' ', code: 'Space' })).toBe('Space')
  })

  it('uppercases single-character keys', () => {
    expect(eventToKeybindKey({ key: 'a', code: 'KeyA' })).toBe('A')
    expect(eventToKeybindKey({ key: 'm', code: 'KeyM' })).toBe('M')
  })

  it('passes through other multi-char keys', () => {
    expect(eventToKeybindKey({ key: 'Escape', code: 'Escape' })).toBe('Escape')
  })
})

describe('matchesKeybind', () => {
  it('matches case-insensitively', () => {
    expect(matchesKeybind({ key: 'm', code: 'KeyM' }, ['M'])).toBe(true)
    expect(matchesKeybind({ key: 'M', code: 'KeyM' }, ['m'])).toBe(true)
  })

  it('matches arrow keys exactly', () => {
    expect(
      matchesKeybind(
        { key: 'ArrowRight', code: 'ArrowRight' },
        ['ArrowRight'],
      ),
    ).toBe(true)
  })

  it('matches numpad codes', () => {
    expect(matchesKeybind({ key: '4', code: 'Numpad4' }, ['Numpad4'])).toBe(
      true,
    )
  })

  it('returns false for unmatched key', () => {
    expect(matchesKeybind({ key: 'x', code: 'KeyX' }, ['M'])).toBe(false)
  })

  it('matches against any binding in the list', () => {
    expect(
      matchesKeybind({ key: 'd', code: 'KeyD' }, ['ArrowRight', 'D']),
    ).toBe(true)
  })
})
