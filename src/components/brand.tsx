import { cn } from '#/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative grid place-items-center rounded-md bg-foreground text-background',
        className,
      )}
    >
      <span className="text-[0.5em] font-bold leading-none tracking-tighter">
        TN
      </span>
      <span className="absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full bg-primary" />
    </div>
  )
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <BrandMark className="size-5" />
      <span className="text-sm font-medium tracking-tight">typenx</span>
    </div>
  )
}
