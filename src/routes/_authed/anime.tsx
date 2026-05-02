import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, ChevronUp, Loader2, Play } from 'lucide-react'

import { cn } from '#/lib/utils'
import { withAuthRedirect } from '#/lib/loaders'
import { Button } from '#/components/ui/button'
import {
  addonName,
  loadAnimeCatalog,
  searchAnimeCatalog,
  watchingLabel,
} from '#/sdk/anime-catalog'
import type {
  AnimeCatalogData,
  CatalogRow,
  WatchingShow,
} from '#/sdk/anime-catalog'
import type { AddonSearchResult, AnimePreview } from '#/sdk'

type FeaturedShow = {
  addon: CatalogRow['addon']
  show: AnimePreview
}

export const Route = createFileRoute('/_authed/anime')({
  validateSearch: (search): { q?: string } => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  loader: ({ location }) =>
    withAuthRedirect(() => loadAnimeCatalog(), location.href),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  pendingComponent: AnimePending,
  errorComponent: AnimeError,
  component: AnimePage,
})

function AnimePage() {
  const { q = '' } = Route.useSearch()
  const data = Route.useLoaderData()
  const trimmedQuery = q.trim()

  const [searchResults, setSearchResults] = React.useState<AddonSearchResult[]>(
    [],
  )
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)

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

    async function runSearch() {
      try {
        setIsSearching(true)
        const results = await searchAnimeCatalog(trimmedQuery)
        if (!cancelled) {
          setSearchResults(results)
          setSearchError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setSearchResults([])
          setSearchError(
            err instanceof Error ? err.message : 'Unable to search anime',
          )
        }
      } finally {
        if (!cancelled) setIsSearching(false)
      }
    }

    void runSearch()
    return () => {
      cancelled = true
    }
  }, [trimmedQuery])

  const featured = React.useMemo<FeaturedShow | null>(() => {
    if (data.watching.length > 0 && data.watching[0]) {
      return {
        addon: data.watching[0].addon,
        show: data.watching[0].show,
      }
    }
    for (const row of data.rows) {
      if (row.shows.length > 0 && row.shows[0]) {
        return {
          addon: row.addon,
          show: row.shows[0],
        }
      }
    }
    return null
  }, [data])

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
        ) : data.rows.length === 0 && data.watching.length === 0 ? (
          <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
            No anime came back from the configured addons.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {data.watching.length > 0 && (
              <CurrentlyWatchingRow shows={data.watching} />
            )}
            {data.rows.map((row) => (
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

function AnimePending() {
  return (
    <div className="px-6 pb-8 pt-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading anime...
      </div>
    </div>
  )
}

function AnimeError({ error }: { error: Error }) {
  return (
    <div className="px-6 pb-8 pt-8">
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error.message || 'Unable to load anime from addons'}
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
        {show && anime?.poster && (
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
          {show && anime && (
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
        Keep typing to search AniList, MyAnimeList, and Kitsu.
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
            {results.length} matches across AniList, MyAnimeList, and Kitsu
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

export type { AnimeCatalogData }
