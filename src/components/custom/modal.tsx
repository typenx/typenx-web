import * as React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

export type ModalVariant = 'info' | 'success' | 'warning' | 'error'

type VariantConfig = {
  icon: LucideIcon
  iconClass: string
  ringClass: string
}

const VARIANTS: Record<ModalVariant, VariantConfig> = {
  info: {
    icon: Info,
    iconClass: 'text-sky-500',
    ringClass: 'bg-sky-500/10 ring-sky-500/20',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    ringClass: 'bg-emerald-500/10 ring-emerald-500/20',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    ringClass: 'bg-amber-500/10 ring-amber-500/20',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-destructive',
    ringClass: 'bg-destructive/10 ring-destructive/20',
  },
}

export type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: ModalVariant
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void | Promise<void>
  destructive?: boolean
  hideCancel?: boolean
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  variant = 'info',
  title,
  description,
  children,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive,
  hideCancel,
  className,
}: ModalProps) {
  const { icon: Icon, iconClass, ringClass } = VARIANTS[variant]
  const [busy, setBusy] = React.useState(false)

  const handleConfirm = async () => {
    if (!onConfirm) {
      onOpenChange(false)
      return
    }
    try {
      setBusy(true)
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-full ring-1',
                ringClass,
              )}
            >
              <Icon className={cn('size-5', iconClass)} />
            </span>
            <div className="flex min-w-0 flex-col gap-1 pt-0.5">
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {children ? <div className="text-sm">{children}</div> : null}

        <DialogFooter>
          {!hideCancel && onConfirm ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            disabled={busy}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
