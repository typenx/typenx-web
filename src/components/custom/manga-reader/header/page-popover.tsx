import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '#/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export function PagePopover({
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
