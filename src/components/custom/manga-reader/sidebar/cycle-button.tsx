import * as React from 'react'
import { Settings } from 'lucide-react'

export function CycleButton({
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
