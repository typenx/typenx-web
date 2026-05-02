import { Menu, Users } from 'lucide-react'

import { ChapterPopover } from './chapter-popover'
import { PagePopover } from './page-popover'
import type { ReaderHeaderProps } from './types'

export type { HeaderChapterOption, ReaderHeaderProps } from './types'

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
