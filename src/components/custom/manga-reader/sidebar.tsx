import * as React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Flag,
  MessageSquare,
  Minus,
  PanelTopClose,
  PanelTopOpen,
  Pin,
  PinOff,
  Settings,
  StretchHorizontal,
  StretchVertical,
  X,
} from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import type {
  HeaderVisibility,
  PageDisplayStyle,
  ProgressBarStyle,
  ReaderSettingsHandle,
  ReadingDirection,
} from './settings'

export type ChapterSummary = {
  id: string
  number: number
  volume?: number | null
  title?: string | null
}

export type ReaderSidebarProps = {
  open: boolean
  pinned: boolean
  onPinToggle: () => void
  onClose: () => void
  seriesTitle: string
  chapterTitle: string
  pageIndex: number
  pageCount: number
  onPageChange: (index: number) => void
  chapter: ChapterSummary
  prevChapter: ChapterSummary | null
  nextChapter: ChapterSummary | null
  onChapterChange: (chapter: ChapterSummary) => void
  uploaders: Array<{ name: string; href?: string }>
  groupName?: string | null
  onReportChapter?: () => void
  onComment?: () => void
  onOpenSettings: (tab?: SettingsShortcut) => void
  handle: ReaderSettingsHandle
}

export type SettingsShortcut =
  | 'page-layout'
  | 'image-fit'
  | 'keybinds'
  | 'behaviors'

export function ReaderSidebar(props: ReaderSidebarProps) {
  const {
    open,
    pinned,
    onPinToggle,
    onClose,
    seriesTitle,
    chapterTitle,
    pageIndex,
    pageCount,
    onPageChange,
    chapter,
    prevChapter,
    nextChapter,
    onChapterChange,
    uploaders,
    groupName,
    onReportChapter,
    onComment,
    onOpenSettings,
    handle,
  } = props

  if (!open) return null

  return (
    <aside
      className={cn(
        'pointer-events-auto z-30 flex h-full w-80 shrink-0 flex-col border-l border-border/60 bg-background text-sm',
      )}
      role="complementary"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <X />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
          onClick={onPinToggle}
        >
          {pinned ? <Pin /> : <PinOff />}
        </Button>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
        <div>
          <p className="text-base font-semibold text-primary">{seriesTitle}</p>
          <p className="text-sm text-muted-foreground">{chapterTitle}</p>
        </div>

        <Stepper
          label="Page"
          value={pageIndex + 1}
          min={1}
          max={Math.max(pageCount, 1)}
          onChange={(next) => onPageChange(Math.max(0, next - 1))}
        />

        <Stepper
          label="Chapter"
          display={`Chapter ${chapter.number}${chapter.title ? ` · ${chapter.title}` : ''}`}
          onPrev={prevChapter ? () => onChapterChange(prevChapter) : null}
          onNext={nextChapter ? () => onChapterChange(nextChapter) : null}
        />

        {onReportChapter && (
          <Button variant="secondary" size="sm" onClick={onReportChapter}>
            <Flag />
            Report Chapter
          </Button>
        )}

        <Button variant="secondary" size="sm" onClick={onComment}>
          <MessageSquare />
          Be the first to comment
        </Button>

        {(uploaders.length > 0 || groupName) && (
          <div>
            <p className="mb-1 text-xs font-medium text-foreground">
              Uploaded By
            </p>
            <div className="flex flex-col gap-1.5">
              {groupName && (
                <UploaderRow icon="group" label={groupName} />
              )}
              {uploaders.map((uploader) => (
                <UploaderRow
                  key={uploader.name}
                  icon="user"
                  label={uploader.name}
                  href={uploader.href}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-1.5">
          <CycleButton
            label={pageDisplayLabel(handle.settings.pageDisplay)}
            icon={pageDisplayIcon(handle.settings.pageDisplay)}
            onClick={() =>
              handle.update({
                pageDisplay: cycle(handle.settings.pageDisplay, [
                  'single',
                  'double',
                  'long-strip',
                  'wide-strip',
                ]),
              })
            }
            onSettings={() => onOpenSettings('page-layout')}
          />
          <CycleButton
            label="Fit Both"
            icon={<FileText className="size-4 rotate-90" />}
            onClick={() =>
              handle.patchImageFit({
                containWidth: !(
                  handle.settings.imageFit.containWidth &&
                  handle.settings.imageFit.containHeight
                ),
                containHeight: !(
                  handle.settings.imageFit.containWidth &&
                  handle.settings.imageFit.containHeight
                ),
              })
            }
            onSettings={() => onOpenSettings('image-fit')}
          />
          <CycleButton
            label={
              handle.settings.readingDirection === 'ltr'
                ? 'Left To Right'
                : 'Right To Left'
            }
            icon={
              handle.settings.readingDirection === 'ltr' ? (
                <ArrowRight className="size-4" />
              ) : (
                <ArrowLeft className="size-4" />
              )
            }
            onClick={() =>
              handle.update({
                readingDirection: cycle<ReadingDirection>(
                  handle.settings.readingDirection,
                  ['ltr', 'rtl'],
                ),
              })
            }
          />
          <CycleButton
            label={
              handle.settings.headerVisibility === 'hidden'
                ? 'Header Hidden'
                : 'Header Shown'
            }
            icon={
              handle.settings.headerVisibility === 'hidden' ? (
                <PanelTopClose className="size-4" />
              ) : (
                <PanelTopOpen className="size-4" />
              )
            }
            onClick={() =>
              handle.update({
                headerVisibility: cycle<HeaderVisibility>(
                  handle.settings.headerVisibility,
                  ['shown', 'hidden'],
                ),
              })
            }
          />
          <CycleButton
            label={progressLabel(handle.settings.progressStyle)}
            icon={progressIcon(handle.settings.progressStyle)}
            onClick={() =>
              handle.update({
                progressStyle: cycle<ProgressBarStyle>(
                  handle.settings.progressStyle,
                  ['hidden', 'lightbar', 'normal'],
                ),
              })
            }
            onSettings={() => onOpenSettings('page-layout')}
          />
          <CycleButton
            label="Reader Settings"
            icon={<Settings className="size-4" />}
            onClick={() => onOpenSettings('page-layout')}
          />
        </div>
      </div>
    </aside>
  )
}

function CycleButton({
  label,
  icon,
  onClick,
  onSettings,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  onSettings?: () => void
}) {
  return (
    <div className="flex items-stretch gap-1.5">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-2.5 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
      >
        {icon}
        {label}
      </button>
      {onSettings && (
        <button
          type="button"
          onClick={onSettings}
          aria-label={`${label} settings`}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-muted px-2.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
        >
          <Settings className="size-4" />
        </button>
      )}
    </div>
  )
}

function Stepper({
  label,
  value,
  display,
  min,
  max,
  onChange,
  onPrev,
  onNext,
}: {
  label: string
  value?: number
  display?: string
  min?: number
  max?: number
  onChange?: (next: number) => void
  onPrev?: (() => void) | null
  onNext?: (() => void) | null
}) {
  const handlePrev = onPrev ?? (
    onChange && value !== undefined && (min === undefined || value > min)
      ? () => onChange(value - 1)
      : undefined
  )
  const handleNext = onNext ?? (
    onChange && value !== undefined && (max === undefined || value < max)
      ? () => onChange(value + 1)
      : undefined
  )

  return (
    <div className="rounded-md border border-border/60 bg-card/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Previous ${label.toLowerCase()}`}
          disabled={!handlePrev}
          onClick={handlePrev ?? undefined}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-1 text-center">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-sm font-medium">
            {display ?? value}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={`Next ${label.toLowerCase()}`}
          disabled={!handleNext}
          onClick={handleNext ?? undefined}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

function UploaderRow({
  icon,
  label,
  href,
}: {
  icon: 'user' | 'group'
  label: string
  href?: string
}) {
  const Component = href ? 'a' : 'div'
  return (
    <Component
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      className={cn(
        'inline-flex items-center gap-2 text-sm text-muted-foreground',
        href && 'hover:text-foreground',
      )}
    >
      {icon === 'group' ? (
        <BookOpen className="size-4" />
      ) : (
        <UserIcon />
      )}
      {label}
    </Component>
  )
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function pageDisplayLabel(value: PageDisplayStyle): string {
  switch (value) {
    case 'single':
      return 'Single Page'
    case 'double':
      return 'Double Page'
    case 'long-strip':
      return 'Long Strip'
    case 'wide-strip':
      return 'Wide Strip'
  }
}

function pageDisplayIcon(value: PageDisplayStyle): React.ReactNode {
  switch (value) {
    case 'single':
      return <FileText className="size-4" />
    case 'double':
      return <BookOpen className="size-4" />
    case 'long-strip':
      return <StretchVertical className="size-4" />
    case 'wide-strip':
      return <StretchHorizontal className="size-4" />
  }
}

function progressLabel(value: ProgressBarStyle): string {
  switch (value) {
    case 'hidden':
      return 'Progress Hidden'
    case 'lightbar':
      return 'Progress Lightbar'
    case 'normal':
      return 'Normal Progress'
  }
}

function progressIcon(value: ProgressBarStyle): React.ReactNode {
  switch (value) {
    case 'hidden':
      return <EyeOff className="size-4" />
    case 'lightbar':
      return <Minus className="size-4" />
    case 'normal':
      return <Eye className="size-4" />
  }
}

function cycle<T>(current: T, list: ReadonlyArray<T>): T {
  const idx = list.indexOf(current)
  if (idx === -1) return list[0]
  return list[(idx + 1) % list.length]
}
