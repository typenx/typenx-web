import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '#/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import type { HeaderChapterOption } from './types'

export function ChapterPopover({
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
