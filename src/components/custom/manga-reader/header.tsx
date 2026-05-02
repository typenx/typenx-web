import * as React from 'react'
import { ChevronDown, Menu, Users } from 'lucide-react'

import { cn } from '#/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export type HeaderChapterOption = {
  id: string
  number: number
  volume?: number | null
  title?: string | null
}

export type ReaderHeaderProps = {
  seriesTitle: string
  chapterTitle: string
  groupName?: string | null
  pageIndex: number
  pageCount: number
  onPageSelect: (index: number) => void
  chapter: HeaderChapterOption
  chapterOptions: Array<HeaderChapterOption>
  onChapterSelect: (chapter: HeaderChapterOption) => void
  onMenuClick: () => void
}

export function ReaderHeader({
  seriesTitle,
  chapterTitle,
  groupName,
  pageIndex,
  pageCount,
  onPageSelect,
  chapter,
  chapterOptions,
  onChapterSelect,
  onMenuClick,
}: ReaderHeaderProps) {
  return (
    <header className="pointer-events-auto z-30 flex flex-col gap-2 border-b border-border/40 bg-background/90 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight">
            {chapterTitle}
          </p>
          <p className="truncate text-sm font-medium text-primary">
            {seriesTitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChapterPopover
          chapter={chapter}
          options={chapterOptions}
          onSelect={onChapterSelect}
        />
        <PagePopover
          pageIndex={pageIndex}
          pageCount={pageCount}
          onSelect={onPageSelect}
        />
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 flex-1 items-center justify-between gap-2 rounded-md bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 sm:flex-initial sm:px-4"
        >
          <span>Menu</span>
          <Menu className="size-4" />
        </button>
      </div>

      {groupName && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          <span>{groupName}</span>
        </div>
      )}
    </header>
  )
}

function ChapterPopover({
  chapter,
  options,
  onSelect,
}: {
  chapter: HeaderChapterOption
  options: Array<HeaderChapterOption>
  onSelect: (chapter: HeaderChapterOption) => void
}) {
  const [open, setOpen] = React.useState(false)
  const label = `Vol. ${chapter.volume ?? '—'}, Ch. ${chapter.number}`
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 flex-1 items-center justify-between gap-2 rounded-md bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 sm:flex-initial sm:px-4"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-72 max-w-[90vw] gap-0 p-0"
      >
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Chapters
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No other chapters
            </p>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full flex-col rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                  option.id === chapter.id && 'bg-muted/70',
                )}
              >
                <span className="font-medium">
                  {option.volume ? `Vol. ${option.volume}, ` : ''}
                  Ch. {option.number}
                </span>
                {option.title && (
                  <span className="truncate text-xs text-muted-foreground">
                    {option.title}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PagePopover({
  pageIndex,
  pageCount,
  onSelect,
}: {
  pageIndex: number
  pageCount: number
  onSelect: (index: number) => void
}) {
  const [open, setOpen] = React.useState(false)
  const display = `Pg. ${pageIndex + 1} / ${pageCount}`
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 flex-1 items-center justify-between gap-2 rounded-md bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 sm:flex-initial sm:px-4"
        >
          <span>{display}</span>
          <ChevronDown className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        className="w-72 max-w-[90vw] gap-0 p-0"
      >
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Jump to page
        </div>
        <div className="grid max-h-72 grid-cols-5 gap-1 overflow-y-auto p-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(i)
                setOpen(false)
              }}
              className={cn(
                'inline-flex aspect-square items-center justify-center rounded-md text-sm font-medium transition-colors',
                i === pageIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/70',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
