import { createFileRoute } from '@tanstack/react-router'
import { useTheme } from 'next-themes'

import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/_authed/settings')({
  component: SettingsPage,
})

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const

function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Settings
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Preferences</h1>
        <p className="text-sm text-muted-foreground">
          Adjust how typenx looks and feels.
        </p>
      </div>

      <Separator className="my-8" />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Appearance</h2>
          <p className="text-xs text-muted-foreground">
            Choose a theme for your interface.
          </p>
        </div>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <Button
              key={t.value}
              variant={theme === t.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </section>
    </div>
  )
}
