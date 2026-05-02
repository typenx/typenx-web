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

type KeybindEvent = Pick<KeyboardEvent, 'key' | 'code'>

export function eventToKeybindKey(e: KeybindEvent): string | null {
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
  e: KeybindEvent,
  bindings: Array<string>,
): boolean {
  const key = eventToKeybindKey(e)
  if (!key) return false
  return bindings.some(
    (b) => b === key || b.toUpperCase() === key.toUpperCase(),
  )
}
