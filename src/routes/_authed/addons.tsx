import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Loader2, Plus, Puzzle, Trash2 } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { withAuthRedirect } from '#/lib/loaders'
import { isTypenxApiError, typenx } from '#/sdk'
import type { AddonRegistration } from '#/sdk'

export const Route = createFileRoute('/_authed/addons')({
  loader: ({ location }) =>
    withAuthRedirect(() => typenx.addons.list(), location.href),
  staleTime: 60_000,
  component: AddonsPage,
  pendingComponent: AddonsPending,
  errorComponent: AddonsError,
})

function AddonsPage() {
  const router = useRouter()
  const addons = Route.useLoaderData()

  const [baseUrl, setBaseUrl] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = baseUrl.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    try {
      await typenx.addons.register({ base_url: trimmed })
      setBaseUrl('')
      await router.invalidate({
        filter: (m) => m.routeId === '/_authed/addons',
      })
    } catch (err) {
      setError(messageFor(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (addon: AddonRegistration) => {
    if (!addon.deletable) return

    setError(null)
    try {
      await typenx.addons.delete(addon.id)
      await router.invalidate({
        filter: (m) => m.routeId === '/_authed/addons',
      })
    } catch (err) {
      setError(messageFor(err))
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Addons
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Extend your typenx
        </h1>
        <p className="text-sm text-muted-foreground">
          Register catalog, metadata, and video source addons by their base URL.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-2 rounded-xl border border-border bg-card/40 p-4"
      >
        <Label htmlFor="addon-url" className="text-xs text-muted-foreground">
          Addon URL
        </Label>
        <div className="flex gap-2">
          <Input
            id="addon-url"
            type="url"
            inputMode="url"
            placeholder="http://127.0.0.1:8787"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            required
          />
          <Button type="submit" disabled={isSubmitting || !baseUrl.trim()}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}
            Add
          </Button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <Separator className="my-8" />

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Installed</h2>
          <span className="text-xs text-muted-foreground">
            {addons.length} {addons.length === 1 ? 'addon' : 'addons'}
          </span>
        </div>

        {addons.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-2">
            {addons.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                onDelete={() => handleDelete(addon)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function AddonsPending() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading addons...
      </div>
    </div>
  )
}

function AddonsError({ error }: { error: Error }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-sm text-destructive">{messageFor(error)}</p>
    </div>
  )
}

function AddonRow({
  addon,
  onDelete,
}: {
  addon: AddonRegistration
  onDelete: () => void
}) {
  const name = addon.manifest?.name ?? hostnameOf(addon.base_url)
  const version = addon.manifest?.version
  const description = addon.manifest?.description
  const icon = addon.manifest?.icon

  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4">
      <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground">
        {icon ? (
          <img src={icon} alt="" className="h-full w-full object-cover" />
        ) : (
          <Puzzle className="size-4" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{name}</p>
          {version && (
            <span className="text-xs text-muted-foreground">v{version}</span>
          )}
          {!addon.enabled && (
            <Badge variant="secondary" className="ml-1">
              Disabled
            </Badge>
          )}
          {addon.source === 'built_in' && (
            <Badge variant="secondary" className="ml-1">
              Built-in
            </Badge>
          )}
        </div>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}
        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
          {addon.base_url}
        </p>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={!addon.deletable}
        aria-label={addon.deletable ? `Delete ${name}` : `${name} is built in`}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/30 p-10 text-center">
      <Puzzle className="size-5 text-muted-foreground" />
      <p className="text-sm font-medium">No addons yet</p>
      <p className="text-xs text-muted-foreground">
        Add a manifest URL above to register your first addon.
      </p>
    </div>
  )
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function messageFor(err: unknown) {
  if (isTypenxApiError(err)) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}
