import type { ReadingDirection } from '../settings'

export function CursorHintsOverlay({
  tapMode,
  direction,
}: {
  tapMode: 'directional' | 'always-forward'
  direction: ReadingDirection
}) {
  if (tapMode === 'always-forward') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 flex">
        <div className="flex-1 ring-1 ring-foreground/0" />
        <div className="flex-2 bg-foreground/[0.03] ring-1 ring-foreground/10" />
      </div>
    )
  }
  const back = direction === 'rtl' ? 'right' : 'left'
  const fwd = direction === 'rtl' ? 'left' : 'right'
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex"
      data-fwd={fwd}
      data-back={back}
    >
      <div className="flex-1 bg-foreground/[0.04] ring-1 ring-foreground/10" />
      <div className="flex-1" />
      <div className="flex-1 bg-foreground/[0.04] ring-1 ring-foreground/10" />
    </div>
  )
}
