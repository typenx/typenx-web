import * as React from 'react'

import { cn } from '#/lib/utils'
import { Checkbox } from '#/components/ui/checkbox'
import { Label } from '#/components/ui/label'

export function Section({
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

export type SegmentOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
}

export function SegmentedGroup<T extends string>({
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

export function CheckboxRow({
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

export function RadioRow({
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
