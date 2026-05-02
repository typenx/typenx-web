import * as React from 'react'

import { matchesKeybind } from '../settings'
import type { ChapterSummary } from '../sidebar'
import type { KeybindMap, ScrollTurnMode } from '../settings'

export type KeybindHandlersDeps = {
  keybinds: KeybindMap
  scrollTurn: ScrollTurnMode
  toggleMenu: () => void
  turnPageRight: () => void
  turnPageLeft: () => void
  turnPageForward: () => void
  turnPageBackward: () => void
  toggleImmersive: () => void
  cycleImageFit: () => void
  offsetSpread: () => void
  prevChapter: ChapterSummary | null
  nextChapter: ChapterSummary | null
  onSelectChapter: (chapter: ChapterSummary) => void
  onEscape: () => void
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export function useKeybindHandlers(deps: KeybindHandlersDeps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isInteractiveTarget(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (matchesKeybind(e, deps.keybinds.toggleMenu)) {
        e.preventDefault()
        deps.toggleMenu()
        return
      }
      if (matchesKeybind(e, deps.keybinds.turnPageRight)) {
        e.preventDefault()
        deps.turnPageRight()
        return
      }
      if (matchesKeybind(e, deps.keybinds.turnPageLeft)) {
        e.preventDefault()
        deps.turnPageLeft()
        return
      }
      if (matchesKeybind(e, deps.keybinds.scrollUp)) {
        if (deps.scrollTurn === 'keyboard' || deps.scrollTurn === 'both') {
          e.preventDefault()
          deps.turnPageBackward()
        }
        return
      }
      if (matchesKeybind(e, deps.keybinds.scrollDown)) {
        if (deps.scrollTurn === 'keyboard' || deps.scrollTurn === 'both') {
          e.preventDefault()
          deps.turnPageForward()
        }
        return
      }
      if (matchesKeybind(e, deps.keybinds.chapterForward)) {
        e.preventDefault()
        if (deps.nextChapter) deps.onSelectChapter(deps.nextChapter)
        return
      }
      if (matchesKeybind(e, deps.keybinds.chapterBackward)) {
        e.preventDefault()
        if (deps.prevChapter) deps.onSelectChapter(deps.prevChapter)
        return
      }
      if (matchesKeybind(e, deps.keybinds.toggleImmersive)) {
        e.preventDefault()
        deps.toggleImmersive()
        return
      }
      if (matchesKeybind(e, deps.keybinds.cycleImageFit)) {
        e.preventDefault()
        deps.cycleImageFit()
        return
      }
      if (matchesKeybind(e, deps.keybinds.offsetDoubleSpreads)) {
        e.preventDefault()
        deps.offsetSpread()
        return
      }
      if (e.key === 'Escape') deps.onEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deps])
}
