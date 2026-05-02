import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crosshair,
  EyeOff,
  FileText,
  MoreHorizontal,
  MousePointer,
  PanelLeftClose,
  PanelTopClose,
  PanelTopOpen,
  Plus,
  RotateCcw,
  Square,
  StretchHorizontal,
  StretchVertical,
} from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Kbd } from '#/components/ui/kbd'
import { Label } from '#/components/ui/label'
import { Slider } from '#/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  DEFAULT_KEYBINDS,
  KEYBIND_LABELS,
  eventToKeybindKey,
  formatKeyLabel,
} from './settings'
import type {
  KeybindAction,
  ProgressBarPosition,
  ProgressBarStyle,
  ReaderSettingsHandle,
} from './settings'

export type SettingsTab = 'page-layout' | 'image-fit' | 'keybinds' | 'behaviors'

export function ReaderSettingsDialog({
  open,
  onOpenChange,
  defaultTab = 'page-layout',
  handle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: SettingsTab
  handle: ReaderSettingsHandle
}) {
  const [tab, setTab] = React.useState<SettingsTab>(defaultTab)

  React.useEffect(() => {
    if (open) setTab(defaultTab)
  }, [open, defaultTab])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="px-5 py-4">
          <DialogTitle>Reader Settings</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as SettingsTab)}
          orientation="vertical"
          className="flex flex-row gap-0 border-t border-border/60"
        >
          <TabsList
            variant="line"
            className="w-44 shrink-0 flex-col items-stretch gap-0 rounded-none border-r border-border/60 bg-transparent p-2"
          >
            <TabsTrigger value="page-layout" className="justify-start px-3">
              Page Layout
            </TabsTrigger>
            <TabsTrigger value="image-fit" className="justify-start px-3">
              Image fit
            </TabsTrigger>
            <TabsTrigger value="keybinds" className="justify-start px-3">
              Keybinds
            </TabsTrigger>
            <TabsTrigger value="behaviors" className="justify-start px-3">
              Behaviors
            </TabsTrigger>
          </TabsList>
          <div className="max-h-[70vh] flex-1 overflow-y-auto">
            <TabsContent value="page-layout" className="p-5">
              <PageLayoutPanel handle={handle} />
            </TabsContent>
            <TabsContent value="image-fit" className="p-5">
              <ImageFitPanel handle={handle} />
            </TabsContent>
            <TabsContent value="keybinds" className="p-5">
              <KeybindsPanel handle={handle} />
            </TabsContent>
            <TabsContent value="behaviors" className="p-5">
              <BehaviorsPanel handle={handle} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function PageLayoutPanel({ handle }: { handle: ReaderSettingsHandle }) {
  const { settings, update, patchExtras } = handle
  return (
    <div className="flex flex-col gap-6">
      <Section title="Page Display Style">
        <SegmentedGroup
          value={settings.pageDisplay}
          onChange={(value) => update({ pageDisplay: value })}
          options={[
            { value: 'single', label: 'Single Page', icon: <FileText /> },
            { value: 'double', label: 'Double Page', icon: <BookOpen /> },
            {
              value: 'long-strip',
              label: 'Long Strip',
              icon: <StretchVertical />,
            },
            {
              value: 'wide-strip',
              label: 'Wide Strip',
              icon: <StretchHorizontal />,
            },
          ]}
        />
      </Section>
      <Section title="Reading Direction">
        <SegmentedGroup
          value={settings.readingDirection}
          onChange={(value) => update({ readingDirection: value })}
          options={[
            { value: 'ltr', label: 'Left To Right', icon: <ArrowRight /> },
            { value: 'rtl', label: 'Right To Left', icon: <ArrowLeft /> },
          ]}
        />
      </Section>
      <Section title="Header Visibility">
        <SegmentedGroup
          value={settings.headerVisibility}
          onChange={(value) => update({ headerVisibility: value })}
          options={[
            { value: 'hidden', label: 'Header Hidden', icon: <PanelTopClose /> },
            { value: 'shown', label: 'Header Shown', icon: <PanelTopOpen /> },
          ]}
        />
      </Section>
      <Section title="Progress Bar Style">
        <SegmentedGroup
          value={settings.progressStyle}
          onChange={(value: ProgressBarStyle) => update({ progressStyle: value })}
          options={[
            { value: 'hidden', label: 'Progress Hidden', icon: <EyeOff /> },
            {
              value: 'lightbar',
              label: 'Progress Lightbar',
              icon: <MoreHorizontal />,
            },
            {
              value: 'normal',
              label: 'Normal Progress',
              icon: <PanelLeftClose className="rotate-90" />,
            },
          ]}
        />
      </Section>
      <Section title="Progress Bar Position">
        <SegmentedGroup
          value={settings.progressPosition}
          onChange={(value: ProgressBarPosition) =>
            update({ progressPosition: value })
          }
          options={[
            { value: 'bottom', label: 'Bottom', icon: <ChevronUp /> },
            { value: 'left', label: 'Left', icon: <ChevronRight /> },
            { value: 'right', label: 'Right', icon: <ChevronLeft /> },
          ]}
        />
      </Section>
      <Section title={`Progress Size: ${settings.progressSize} pixels`}>
        <Slider
          value={[settings.progressSize]}
          min={1}
          max={16}
          step={1}
          onValueChange={([v]) => update({ progressSize: v })}
          aria-label="Progress size"
          className="w-64"
        />
      </Section>
      <Section title="Cursor action hints">
        <SegmentedGroup
          value={settings.cursorHints}
          onChange={(value) => update({ cursorHints: value })}
          options={[
            { value: 'none', label: 'None', icon: <Square /> },
            { value: 'overlay', label: 'Overlay', icon: <Crosshair /> },
            { value: 'cursor', label: 'Cursor', icon: <MousePointer /> },
          ]}
        />
      </Section>
      <Section title="Reader extras">
        <div className="flex flex-col gap-2">
          <CheckboxRow
            label="Show menu button when the menu is pinned and the header is hidden"
            checked={settings.extras.showMenuButtonWhenPinned}
            onChange={(v) => patchExtras({ showMenuButtonWhenPinned: v })}
          />
          <CheckboxRow
            label="Show page number when progress bar is hidden"
            checked={settings.extras.showPageNumberWhenHidden}
            onChange={(v) => patchExtras({ showPageNumberWhenHidden: v })}
          />
          <CheckboxRow
            label="Greyscale pages"
            checked={settings.extras.greyscale}
            onChange={(v) => patchExtras({ greyscale: v })}
          />
          <CheckboxRow
            label="Dim pages"
            checked={settings.extras.dimPages}
            onChange={(v) => patchExtras({ dimPages: v })}
          />
        </div>
      </Section>
      <Section title="Reader Background Color">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-4 rounded-full border border-border bg-background"
          />
          <SegmentedGroup
            value={settings.background}
            onChange={(value) => update({ background: value })}
            options={[
              { value: 'theme', label: 'Use Theme' },
              { value: 'white', label: 'White' },
              { value: 'black', label: 'Black' },
            ]}
          />
        </div>
      </Section>
    </div>
  )
}

function ImageFitPanel({ handle }: { handle: ReaderSettingsHandle }) {
  const { settings, patchImageFit } = handle
  return (
    <div className="flex flex-col gap-6">
      <Section title="Image Sizing">
        <div className="flex flex-col gap-2">
          <CheckboxRow
            label="Contain to width"
            checked={settings.imageFit.containWidth}
            onChange={(v) => patchImageFit({ containWidth: v })}
          />
          <CheckboxRow
            label="Contain to height"
            checked={settings.imageFit.containHeight}
            onChange={(v) => patchImageFit({ containHeight: v })}
          />
          <CheckboxRow
            label="Stretch small pages"
            checked={settings.imageFit.stretchSmall}
            onChange={(v) => patchImageFit({ stretchSmall: v })}
          />
        </div>
      </Section>
      <hr className="border-border/60" />
      <Section title="Maximum Bounds">
        <div className="flex flex-col gap-2">
          <CheckboxRow
            label="Limit max width"
            checked={settings.imageFit.limitMaxWidth}
            onChange={(v) => patchImageFit({ limitMaxWidth: v })}
          />
          <CheckboxRow
            label="Limit max height"
            checked={settings.imageFit.limitMaxHeight}
            onChange={(v) => patchImageFit({ limitMaxHeight: v })}
          />
        </div>
      </Section>
    </div>
  )
}

function KeybindsPanel({ handle }: { handle: ReaderSettingsHandle }) {
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
        Add a new keybind to an action by clicking the <Plus className="inline size-3" /> button and pressing
        any key (press <Kbd>Esc</Kbd> to cancel). A key can only be bound to one
        action.
      </p>
      <p className="text-muted-foreground">
        Remove a keybind by clicking on it. Reset an action&apos;s keybinds to its
        defaults with the <RotateCcw className="inline size-3" /> button.
      </p>
      <div className="mt-2 flex flex-col">
        {actions.map((action) => (
          <div
            key={action}
            className="flex items-center gap-2 border-b border-border/40 py-2"
          >
            <span className="flex-1 text-sm">{KEYBIND_LABELS[action]}</span>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {settings.keybinds[action].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => removeKey(action, key)}
                  className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Click to remove"
                >
                  {formatKeyLabel(key)}
                </button>
              ))}
              {capturingFor === action && (
                <span className="inline-flex items-center rounded-md border border-primary px-2 py-1 text-xs text-primary">
                  Press a key…
                </span>
              )}
              <Button
                size="icon"
                variant="secondary"
                className="size-7"
                aria-label="Add keybind"
                onClick={() => setCapturingFor(action)}
              >
                <Plus className="size-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label="Reset to default"
                onClick={() => resetKeybindsForAction(action)}
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>
          </div>
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

function BehaviorsPanel({ handle }: { handle: ReaderSettingsHandle }) {
  const { settings, patchBehaviors } = handle
  const b = settings.behaviors

  return (
    <div className="flex flex-col gap-6">
      <Section title="Automatically advance chapter on last page">
        <SegmentedGroup
          value={b.autoAdvanceChapter ? 'enabled' : 'disabled'}
          onChange={(value) =>
            patchBehaviors({ autoAdvanceChapter: value === 'enabled' })
          }
          options={[
            { value: 'disabled', label: 'Disabled' },
            { value: 'enabled', label: 'Enabled' },
          ]}
        />
      </Section>
      <Section title="Reader history mode">
        <div className="flex flex-col gap-1.5">
          <RadioRow
            label="Page URL and title won't update"
            checked={b.historyMode === 'page-url-stable'}
            onSelect={() => patchBehaviors({ historyMode: 'page-url-stable' })}
          />
          <RadioRow
            label="Page URL and title both update"
            checked={b.historyMode === 'page-url-updates'}
            onSelect={() => patchBehaviors({ historyMode: 'page-url-updates' })}
          />
          <RadioRow
            label="Page URL and title update, and browser buttons work"
            checked={b.historyMode === 'page-url-updates-history'}
            onSelect={() =>
              patchBehaviors({ historyMode: 'page-url-updates-history' })
            }
          />
        </div>
      </Section>
      <Section title="Turn pages by tapping">
        <SegmentedGroup
          value={b.tapTurn}
          onChange={(value) => patchBehaviors({ tapTurn: value })}
          options={[
            { value: 'directional', label: 'Directional' },
            { value: 'always-forward', label: 'Always turn forward' },
            { value: 'never', label: 'Never' },
          ]}
        />
      </Section>
      <Section title="Turn pages by scrolling">
        <SegmentedGroup
          value={b.scrollTurn}
          onChange={(value) => patchBehaviors({ scrollTurn: value })}
          options={[
            { value: 'disabled', label: 'Disabled' },
            { value: 'mouse-wheel', label: 'Mouse wheel' },
            { value: 'keyboard', label: 'Keyboard' },
            { value: 'both', label: 'Both' },
          ]}
        />
      </Section>
      <Section title="Double click to toggle fullscreen">
        <SegmentedGroup
          value={b.doubleClickFullscreen ? 'enabled' : 'disabled'}
          onChange={(value) =>
            patchBehaviors({ doubleClickFullscreen: value === 'enabled' })
          }
          options={[
            { value: 'disabled', label: 'Disabled' },
            { value: 'enabled', label: 'Enabled' },
          ]}
        />
      </Section>
      <Section title="Auto scroll up on image fit:">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <CheckboxRow
              label="Width"
              checked={b.autoScrollLocks.width}
              onChange={(v) =>
                patchBehaviors({
                  autoScrollLocks: { ...b.autoScrollLocks, width: v },
                })
              }
            />
            <CheckboxRow
              label="Height"
              checked={b.autoScrollLocks.height}
              onChange={(v) =>
                patchBehaviors({
                  autoScrollLocks: { ...b.autoScrollLocks, height: v },
                })
              }
            />
            <CheckboxRow
              label="None"
              checked={b.autoScrollLocks.none}
              onChange={(v) =>
                patchBehaviors({
                  autoScrollLocks: { ...b.autoScrollLocks, none: v },
                })
              }
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              patchBehaviors({
                autoScrollLocks: { width: true, height: true, none: true },
              })
            }
          >
            Reset Locks
          </Button>
        </div>
      </Section>
      <Section title="Auto scroll offset">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={String(b.autoScrollOffset)}
            onChange={(e) =>
              patchBehaviors({
                autoScrollOffset: Number(e.currentTarget.value) || 0,
              })
            }
            className="w-32"
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={b.autoScrollOffset === 0}
            onClick={() => patchBehaviors({ autoScrollOffset: 0 })}
          >
            Reset Offset
          </Button>
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  )
}

type SegmentOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
}

function SegmentedGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<SegmentOption<T>>
}) {
  return (
    <div className="inline-flex flex-wrap rounded-md bg-muted p-0.5">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            data-active={active || undefined}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.icon && (
              <span aria-hidden className="[&>svg]:size-4">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = React.useId()
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 rounded-md py-0.5 text-sm"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <Label htmlFor={id} className="cursor-pointer font-normal">
        {label}
      </Label>
    </label>
  )
}

function RadioRow({
  label,
  checked,
  onSelect,
}: {
  label: string
  checked: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
        checked
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border/60 text-muted-foreground hover:bg-muted',
      )}
    >
      <span>{label}</span>
      {checked && (
        <span className="size-2 rounded-full bg-primary" aria-hidden />
      )}
    </button>
  )
}

