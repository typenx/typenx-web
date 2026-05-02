import { BookOpen } from 'lucide-react'

import { cn } from '#/lib/utils'

export function UploaderRow({
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
      {icon === 'group' ? <BookOpen className="size-4" /> : <UserIcon />}
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
