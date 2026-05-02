import * as React from 'react'

export function useFullscreen(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const requestFullscreen = React.useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement === el) {
      void document.exitFullscreen().catch(() => {})
    } else {
      void el.requestFullscreen().catch(() => {})
    }
  }, [containerRef])
  return { requestFullscreen }
}
