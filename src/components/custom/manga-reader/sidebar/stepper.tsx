import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '#/components/ui/button'

export function Stepper({
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
          <p className="text-sm font-medium">{display ?? value}</p>
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
