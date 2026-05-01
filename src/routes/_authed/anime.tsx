import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, ChevronUp, Loader2, Play } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { typenx } from '#/sdk'
import type {
  AddonRegistration,
  AddonSearchResult,
  AnimeListEntry,
  AnimePreview,
  AuthProvider,
  ProviderAccount,
} from '#/sdk'

export const Route = createFileRoute('/_authed/anime')({
  validateSearch: (search): { q?: string } => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  component: AnimePage,
})

type CatalogRow = {
  addon: AddonRegistration
  shows: AnimePreview[]
  error: string | null
}

type WatchingShow = {
  addon: AddonRegistration
  entry: AnimeListEntry
  show: AnimePreview
}

type FeaturedShow = {
  addon: AddonRegistration
  show: AnimePreview
}

function AnimePage() {
  const { q = '' } = Route.useSearch()
  const [rows, setRows] = React.useState<CatalogRow[]>([])
  const [watching, setWatching] = React.useState<WatchingShow[]>([])
  const [searchResults, setSearchResults] = React.useState<AddonSearchResult[]>(
    [],
  )
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const trimmedQuery = q.trim()

  React.useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        setIsLoading(true)
        const [addons, providers, library] = await Promise.all([
          typenx.addons.list(),
          typenx.me.providers(),
          typenx.me.library(),
        ])
        const selectedAddons = selectCatalogAddons(addons, providers)
        const [loadedRows, loadedWatching] = await Promise.all([
          Promise.all(
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
          ),
          loadCurrentlyWatching(library, selectedAddons),
        ])

        if (!cancelled) {
          setRows(loadedRows)
          setWatching(loadedWatching)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setRows([])
          setWatching([])
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

  React.useEffect(() => {
    let cancelled = false

    if (trimmedQuery.length < 2) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return () => {
        cancelled = true
      }
    }

    const timeoutId = window.setTimeout(() => {
      async function searchAnime() {
        try {
          setIsSearching(true)
          const results = await typenx.catalog.searchAddons({
            query: trimmedQuery,
            limit: 18,
          })

          if (!cancelled) {
            setSearchResults(results)
            setSearchError(null)
          }
        } catch (err) {
          if (!cancelled) {
            setSearchResults([])
            setSearchError(
              err instanceof Error
                ? err.message
                : 'Unable to search anime addons',
            )
          }
        } finally {
          if (!cancelled) setIsSearching(false)
        }
      }

      void searchAnime()
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [trimmedQuery])

  const featured = React.useMemo(() => {
    if (watching.length > 0 && watching[0]) {
      return {
        addon: watching[0].addon,
        show: watching[0].show,
      }
    }
    for (const row of rows) {
      if (row.shows.length > 0 && row.shows[0]) {
        return {
          addon: row.addon,
          show: row.shows[0],
        }
      }
    }
    return null
  }, [watching, rows])

  return (
    <div>
      {trimmedQuery.length === 0 && <FeaturedHero show={featured} />}

      <div className="px-6 pb-8 pt-8">
        {trimmedQuery.length > 0 ? (
          <SearchResults
            query={trimmedQuery}
            results={searchResults}
            isSearching={isSearching}
            error={searchError}
          />
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading anime...</p>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : rows.length === 0 && watching.length === 0 ? (
          <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
            No anime came back from the configured addons.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {watching.length > 0 && <CurrentlyWatchingRow shows={watching} />}
            {rows.map((row) => (
              <ShowRow
                key={row.addon.id}
                title={`${addonName(row.addon)} Anime`}
                caption={row.error ?? `Served by ${addonName(row.addon)}.`}
                addonId={row.addon.id}
                shows={row.shows}
                isError={!!row.error}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FeaturedHero({ show }: { show: FeaturedShow | null }) {
  const anime = show?.show
  const backdrop = anime?.banner ?? anime?.poster ?? null

  return (
    <section className="relative min-h-[360px] overflow-hidden border-b border-border">
      <div className="absolute inset-0">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-end sm:py-16">
        {anime?.poster && (
          <Link
            to="/show/$id"
            params={{ id: anime.id }}
            search={{ addon_id: show.addon.id }}
            className="w-32 shrink-0 overflow-hidden rounded-lg bg-muted shadow-2xl ring-1 ring-border/60 transition-opacity hover:opacity-95 sm:w-40"
          >
            <div className="aspect-[2/3]">
              <img
                src={anime.poster}
                alt={anime.title}
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        )}

        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Featured
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {anime?.title ?? "Discover what's airing"}
          </h1>
          {anime?.synopsis ? (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {anime.synopsis}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pick up where you left off, or jump into something new from your
              linked addons.
            </p>
          )}
          {anime && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="lg" asChild className="gap-2">
                <Link
                  to="/show/$id"
                  params={{ id: anime.id }}
                  search={{ addon_id: show.addon.id }}
                >
                  <Play className="fill-current" />
                  Play
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

async function loadCurrentlyWatching(
  library: AnimeListEntry[],
  addons: AddonRegistration[],
) {
  const watchingEntries = library
    .filter((entry) => entry.status === 'watching')
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 12)

  const loaded = await Promise.all(
    watchingEntries.map(async (entry) => {
      const addon = addonForProvider(addons, entry.provider)
      if (!addon) return null

      try {
        const response = await typenx.catalog.search({
          addon_id: addon.id,
          query: entry.title,
          limit: 5,
        })
        const show =
          response.items.find((item) => item.id === entry.provider_anime_id) ??
          response.items.find(
            (item) => item.title.toLowerCase() === entry.title.toLowerCase(),
          ) ??
          response.items.at(0)

        if (!show) return null
        return { addon, entry, show }
      } catch {
        return {
          addon,
          entry,
          show: {
            id: entry.provider_anime_id,
            title: entry.title,
            poster: null,
            year: null,
            content_type: 'anime' as const,
          },
        }
      }
    }),
  )

  return loaded.filter((item): item is WatchingShow => !!item)
}

function CurrentlyWatchingRow({ shows }: { shows: WatchingShow[] }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Continue watching
        </h2>
        <p className="text-xs text-muted-foreground">
          Synced from your linked anime list.
        </p>
      </div>
      <div className="-mx-6 overflow-x-auto px-6 pb-3 [scrollbar-width:thin]">
        <div className="flex gap-4">
          {shows.map(({ addon, entry, show }) => (
            <ShowCard
              key={`${entry.provider}:${entry.provider_anime_id}`}
              show={show}
              addonId={addon.id}
              addonLabel={watchingLabel(entry, addon)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowRow({
  title,
  caption,
  addonId,
  shows,
  isError = false,
}: {
  title: string
  caption: string
  addonId: string
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
            <ShowCard key={show.id} show={show} addonId={addonId} fill />
          ))}
        </div>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6 pb-3 [scrollbar-width:thin]">
          <div className="flex gap-4">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} addonId={addonId} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function ShowCard({
  show,
  addonId,
  addonLabel,
  fill = false,
}: {
  show: AnimePreview
  addonId: string
  addonLabel?: string
  fill?: boolean
}) {
  return (
    <Link
      to="/show/$id"
      params={{ id: show.id }}
      search={{ addon_id: addonId }}
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
        {[show.year ?? 'Unknown year', addonLabel].filter(Boolean).join(' - ')}
      </p>
    </Link>
  )
}

function SearchResults({
  query,
  results,
  isSearching,
  error,
}: {
  query: string
  results: AddonSearchResult[]
  isSearching: boolean
  error: string | null
}) {
  if (query.length < 2) {
    return (
      <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
        Keep typing to search AniList and MyAnimeList.
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (isSearching && results.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Searching AniList and MyAnimeList...
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
        No anime matched "{query}".
      </div>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Search results
          </h2>
          <p className="text-xs text-muted-foreground">
            {results.length} matches across AniList and MyAnimeList
          </p>
        </div>
        {isSearching && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map((result) => (
          <ShowCard
            key={`${result.addon.id}:${result.item.id}`}
            show={result.item}
            addonId={result.addon.id}
            addonLabel={addonName(result.addon)}
            fill
          />
        ))}
      </div>
    </section>
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
  const providerOrder: string[] = providers.map((provider) =>
    provider.provider === 'anilist'
      ? 'typenx-addon-anilist'
      : 'typenx-addon-myanimelist',
  )

  const linkedOfficial = providerOrder
    .map((manifestId) =>
      official.find((addon) => addon.manifest?.id === manifestId),
    )
    .filter((addon): addon is AddonRegistration => !!addon)
  const unlinkedOfficial = official.filter(
    (addon) => !providerOrder.includes(addon.manifest?.id ?? ''),
  )
  const selected = uniqueAddons([...linkedOfficial, ...unlinkedOfficial])

  if (selected.length > 0) return uniqueAddons(selected)
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

function addonForProvider(addons: AddonRegistration[], provider: AuthProvider) {
  const manifestId =
    provider === 'anilist'
      ? 'typenx-addon-anilist'
      : 'typenx-addon-myanimelist'

  return addons.find((addon) => addon.manifest?.id === manifestId)
}

function watchingLabel(entry: AnimeListEntry, addon: AddonRegistration) {
  const progress =
    entry.total_episodes && entry.total_episodes > 0
      ? `${entry.progress_episodes}/${entry.total_episodes} eps`
      : `${entry.progress_episodes} eps`

  return `${progress} - ${addonName(addon)}`
}

function addonName(addon: AddonRegistration) {
  try {
    return addon.manifest?.name ?? new URL(addon.base_url).hostname
  } catch {
    return addon.manifest?.name ?? addon.base_url
  }
}
