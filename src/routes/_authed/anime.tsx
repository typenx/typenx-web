import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight, ChevronUp, Loader2 } from 'lucide-react'

import { useAuth } from '#/components/auth-provider'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { typenx } from '#/sdk'
import type {
  AddonRegistration,
  AnimePreview,
  ProviderAccount,
} from '#/sdk'

export const Route = createFileRoute('/_authed/anime')({ component: AnimePage })

type CatalogRow = {
  addon: AddonRegistration
  shows: AnimePreview[]
  error: string | null
}

function AnimePage() {
  const { user } = useAuth()
  const [rows, setRows] = React.useState<CatalogRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const display = user?.display_name ?? 'Typenx user'

  React.useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        setIsLoading(true)
        const [addons, providers] = await Promise.all([
          typenx.addons.list(),
          typenx.me.providers(),
        ])
        const selectedAddons = selectCatalogAddons(addons, providers)
        const loadedRows = await Promise.all(
          selectedAddons.map(async (addon) => {
            try {
              const response = await typenx.catalog.catalogs({
                addon_id: addon.id,
                catalog_id: preferredCatalogId(addon),
                limit: 24,
              })
              return { addon, shows: response.items, error: null }
            } catch (err) {
              return {
                addon,
                shows: [],
                error:
                  err instanceof Error
                    ? err.message
                    : `Unable to load ${addonName(addon)}`,
              }
            }
          }),
        )
        if (!cancelled) {
          setRows(loadedRows)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setRows([])
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load anime from addons',
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadCatalog()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="px-6 py-8">
      <div className="mb-10 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Dashboard
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {display}
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse anime from your linked provider addons.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading anime...</p>
      )}

      {!isLoading && error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
          No anime came back from the configured addons.
        </div>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="flex flex-col gap-10">
          {rows.map((row) => (
            <ShowRow
              key={row.addon.id}
              title={`${addonName(row.addon)} Anime`}
              caption={row.error ?? `Served by ${addonName(row.addon)}.`}
              shows={row.shows}
              isError={!!row.error}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ShowRow({
  title,
  caption,
  shows,
  isError = false,
}: {
  title: string
  caption: string
  shows: AnimePreview[]
  isError?: boolean
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const canExpand = shows.length > 0 && !isError

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p
            className={
              isError
                ? 'text-xs text-destructive'
                : 'text-xs text-muted-foreground'
            }
          >
            {isExpanded && !isError ? `${shows.length} shows` : caption}
          </p>
        </div>
        {canExpand && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setIsExpanded((v) => !v)}
          >
            {isExpanded ? 'Show less' : 'See all'}
            {isExpanded ? <ChevronUp /> : <ChevronRight />}
          </Button>
        )}
      </div>

      {shows.length === 0 ? (
        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-border bg-card/30 text-sm text-muted-foreground">
          {isError ? (
            'This addon did not return a catalog.'
          ) : (
            <Loader2 className="size-4 animate-spin" />
          )}
        </div>
      ) : isExpanded ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} fill />
          ))}
        </div>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6 pb-3 [scrollbar-width:thin]">
          <div className="flex gap-4">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function ShowCard({
  show,
  fill = false,
}: {
  show: AnimePreview
  fill?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        'group flex flex-col text-left transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        fill ? 'w-full' : 'w-40 shrink-0',
      )}
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
        {show.poster ? (
          <img
            src={show.poster}
            alt={show.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center px-3 text-center text-xs text-muted-foreground">
            {show.title}
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium">{show.title}</p>
      <p className="text-xs capitalize text-muted-foreground">
        {show.year ?? 'Unknown year'}
      </p>
    </button>
  )
}

function selectCatalogAddons(
  addons: AddonRegistration[],
  providers: ProviderAccount[],
) {
  const enabled = addons.filter((addon) => addon.enabled)
  const official = enabled.filter((addon) =>
    ['typenx-addon-anilist', 'typenx-addon-myanimelist'].includes(
      addon.manifest?.id ?? '',
    ),
  )
  const providerOrder = providers.map((provider) =>
    provider.provider === 'anilist'
      ? 'typenx-addon-anilist'
      : 'typenx-addon-myanimelist',
  )

  const selected = providerOrder
    .map((manifestId) =>
      official.find((addon) => addon.manifest?.id === manifestId),
    )
    .filter((addon): addon is AddonRegistration => !!addon)

  if (selected.length > 0) return uniqueAddons(selected)
  if (official.length > 0) return official
  return enabled
}

function uniqueAddons(addons: AddonRegistration[]) {
  const seen = new Set<string>()
  return addons.filter((addon) => {
    if (seen.has(addon.id)) return false
    seen.add(addon.id)
    return true
  })
}

function preferredCatalogId(addon: AddonRegistration) {
  const catalogs = addon.manifest?.catalogs ?? []
  if (catalogs.some((catalog) => catalog.id === 'popular')) return 'popular'
  return catalogs[0]?.id ?? 'popular'
}

function addonName(addon: AddonRegistration) {
  try {
    return addon.manifest?.name ?? new URL(addon.base_url).hostname
  } catch {
    return addon.manifest?.name ?? addon.base_url
  }
}
