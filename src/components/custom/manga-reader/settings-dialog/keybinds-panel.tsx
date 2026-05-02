import * as React from 'react'
import { Plus, RotateCcw } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Kbd } from '#/components/ui/kbd'
import {
  DEFAULT_KEYBINDS,
  KEYBIND_LABELS,
  eventToKeybindKey,
  formatKeyLabel,
} from '../settings'
import type { KeybindAction, ReaderSettingsHandle } from '../settings'

export function KeybindsPanel({ handle }: { handle: ReaderSettingsHandle }) {
  const { settings, setKeybind, resetKeybinds, resetKeybindsForAction } = handle
  const [capturingFor, setCapturingFor] = React.useState<KeybindAction | null>(
    null,
  )

  React.useEffect(() => {
    if (!capturingFor) return
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key === 'Escape') {
        setCapturingFor(null)
        return
      }
      const key = eventToKeybindKey(e)
      if (!key) return
      const existing = settings.keybinds[capturingFor]
      if (!existing.includes(key)) {
        setKeybind(capturingFor, [...existing, key])
      }
      setCapturingFor(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [capturingFor, settings.keybinds, setKeybind])

  const removeKey = (action: KeybindAction, key: string) => {
    const current = settings.keybinds[action]
    setKeybind(
      action,
      current.filter((k) => k !== key),
    )
  }

  const actions = Object.keys(KEYBIND_LABELS) as Array<KeybindAction>

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-muted-foreground">
        Add a new keybind to an action by clicking the{' '}
        <Plus className="inline size-3" /> button and pressing any key (press{' '}
        <Kbd>Esc</Kbd> to cancel). A key can only be bound to one action.
      </p>
      <p className="text-muted-foreground">
        Remove a keybind by clicking on it. Reset an action&apos;s keybinds to
        its defaults with the <RotateCcw className="inline size-3" /> button.
      </p>
      <div className="mt-2 flex flex-col">
        {actions.map((action) => (
          <KeybindRow
            key={action}
            action={action}
            label={KEYBIND_LABELS[action]}
            keys={settings.keybinds[action]}
            capturing={capturingFor === action}
            onRequestCapture={() => setCapturingFor(action)}
            onRemoveKey={(key) => removeKey(action, key)}
            onReset={() => resetKeybindsForAction(action)}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="secondary" onClick={resetKeybinds}>
          <RotateCcw />
          Reset All to Default Values
        </Button>
      </div>
      <DefaultsHint />
    </div>
  )
}

function KeybindRow({
  label,
  keys,
  capturing,
  onRequestCapture,
  onRemoveKey,
  onReset,
}: {
  action: KeybindAction
  label: string
  keys: Array<string>
  capturing: boolean
  onRequestCapture: () => void
  onRemoveKey: (key: string) => void
  onReset: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/40 py-2">
      <span className="flex-1 text-sm">{label}</span>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onRemoveKey(key)}
            className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Click to remove"
          >
            {formatKeyLabel(key)}
          </button>
        ))}
        {capturing && (
          <span className="inline-flex items-center rounded-md border border-primary px-2 py-1 text-xs text-primary">
            Press a key…
          </span>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="size-7"
          aria-label="Add keybind"
          onClick={onRequestCapture}
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          aria-label="Reset to default"
          onClick={onReset}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

function DefaultsHint() {
  const actions = Object.keys(DEFAULT_KEYBINDS) as Array<KeybindAction>
  return (
    <details className="rounded-md border border-border/60 px-3 py-2 text-xs text-muted-foreground">
      <summary className="cursor-pointer text-foreground/80">
        Default keybinds
      </summary>
      <ul className="mt-2 space-y-1">
        {actions.map((action) => (
          <li key={action} className="flex justify-between gap-3">
            <span>{KEYBIND_LABELS[action]}</span>
            <span className="font-mono">
              {DEFAULT_KEYBINDS[action].map(formatKeyLabel).join(', ')}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}
