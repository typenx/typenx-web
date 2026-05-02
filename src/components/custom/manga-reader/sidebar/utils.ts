export function cycle<T>(current: T, list: ReadonlyArray<T>): T {
  const idx = list.indexOf(current)
  if (idx === -1) return list[0]
  return list[(idx + 1) % list.length]
}
