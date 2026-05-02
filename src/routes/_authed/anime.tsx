import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Play,
  Star,
} from 'lucide-react'

import { cn } from '#/lib/utils'
import { withAuthRedirect } from '#/lib/loaders'
import { Button } from '#/components/ui/button'
import {
  addonName,
  loadAnimeCatalog,
  searchAnimeCatalog,
} from '#/sdk/anime-catalog'
import type {
  AnimeCatalogData,
  CatalogRow,
  FeaturedShowDetails,
  WatchingShow,
} from '#/sdk/anime-catalog'
import type { AddonSearchResult, AnimePreview } from '#/sdk'

export const Route = createFileRoute('/_authed/anime')({
  validateSearch: (search): { q?: string; genre?: string } => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    genre: typeof search.genre === 'string' ? search.genre : undefined,
  }),
  loader: ({ location }) =>
    withAuthRedirect(() => loadAnimeCatalog(), location.href),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  pendingComponent: AnimePending,
  errorComponent: AnimeError,
  component: AnimePage,
})

const GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
] as const

function AnimePage() {
  const { q = '', genre } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const data = Route.useLoaderData()
  const trimmedQuery = q.trim()
  const activeGenre = isKnownGenre(genre) ? genre : 'All Genres'
  const filteredRows = React.useMemo(
    () => filterRowsByGenre(data.rows, activeGenre),
    [data.rows, activeGenre],
  )
  const filteredWatching = React.useMemo(
    () => filterWatchingByGenre(data.watching, activeGenre),
    [data.watching, activeGenre],
  )
  const hasVisibleShows =
    filteredWatching.length > 0 ||
    filteredRows.some((row) => row.error || row.shows.length > 0)

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

  if (trimmedQuery.length > 0) {
    return (
      <div className="px-6 py-6">
        <SearchResults
          query={trimmedQuery}
          results={searchResults}
          isSearching={isSearching}
          error={searchError}
        />
      </div>
    )
  }

  if (data.rows.length === 0 && data.watching.length === 0) {
    return (
      <div className="px-6 py-6">
        <div className="rounded-lg border bg-card/30 px-4 py-3 text-sm text-muted-foreground">
          No anime came back from the configured addons.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <FeaturedHero featured={data.featured} />

      <GenreRow
        active={activeGenre}
        onSelect={(nextGenre) =>
          navigate({
            search: (prev) => ({
              ...prev,
              genre: nextGenre === 'All Genres' ? undefined : nextGenre,
            }),
            replace: true,
          })
        }
      />

      <div className="flex flex-col gap-8">
        {filteredWatching.length > 0 && (
          <CardRow
            title={
              activeGenre === 'All Genres'
                ? 'Continue watching'
                : `Continue watching ${activeGenre}`
            }
            shows={filteredWatching.map(({ addon, show }) => ({ addon, show }))}
          />
        )}
        {!hasVisibleShows && (
          <div className="rounded-lg border bg-card/30 px-4 py-3 text-sm text-muted-foreground">
            No {activeGenre} anime came back from the configured addons.
          </div>
        )}
        {filteredRows.map((row) => (
          <AddonCardRow key={row.addon.id} row={row} />
        ))}
      </div>
    </div>
  )
}

function isKnownGenre(value: string | undefined): value is (typeof GENRES)[number] {
  return GENRES.some((genre) => genre === value)
}

function filterRowsByGenre(rows: CatalogRow[], genre: string): CatalogRow[] {
  if (genre === 'All Genres') return rows
  return rows.map((row) => ({
    ...row,
    shows: row.shows.filter((show) => hasGenre(show, genre)),
  }))
}

function filterWatchingByGenre(
  shows: WatchingShow[],
  genre: string,
): WatchingShow[] {
  if (genre === 'All Genres') return shows
  return shows.filter(({ show }) => hasGenre(show, genre))
}

function hasGenre(show: AnimePreview, genre: string) {
  const target = normalizeGenre(genre)
  return (show.genres ?? []).some((item) => normalizeGenre(item) === target)
}

function normalizeGenre(value: string) {
  return value.trim().toLowerCase().replaceAll(/[\s_-]+/g, ' ')
}

function AnimePending() {
  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 size-4 animate-spin" />
      Loading anime...
    </div>
  )
}

function AnimeError({ error }: { error: Error }) {
  return (
    <div className="px-6 py-6">
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error.message || 'Unable to load anime from addons'}
      </div>
    </div>
  )
}

function FeaturedHero({ featured }: { featured: FeaturedShowDetails | null }) {
  const anime = featured?.show
  const metadata = featured?.metadata
  const title = metadata?.title ?? anime?.title ?? "Discover what's airing"
  const synopsis =
    metadata?.synopsis ??
    metadata?.description ??
    anime?.synopsis ??
    'Pick up where you left off, or jump into something new from your linked addons.'
  const backdrop =
    metadata?.banner ??
    anime?.banner ??
    metadata?.poster ??
    anime?.poster ??
    null

  return (
    <section className="relative h-[320px] overflow-hidden rounded-2xl border bg-card sm:h-[360px]">
      <div className="absolute inset-0">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10 sm:via-background/70" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Featured
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {synopsis}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {featured && anime ? (
              <>
                <Button size="lg" asChild className="gap-2">
                  <Link
                    to="/show/$id"
                    params={{ id: anime.id }}
                    search={{ addon_id: featured.addon.id }}
                  >
                    <Play className="fill-current" />
                    Watch Now
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link
                    to="/show/$id"
                    params={{ id: anime.id }}
                    search={{ addon_id: featured.addon.id }}
                  >
                    <Info />
                    More Info
                  </Link>
                </Button>
              </>
            ) : null}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex flex-col gap-1.5">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span className="size-1.5 rounded-full bg-foreground/30" />
              <span className="size-1.5 rounded-full bg-foreground/30" />
            </div>
            <div className="flex flex-col gap-2">
              <Button size="icon" variant="secondary" disabled>
                <ChevronLeft />
              </Button>
              <Button size="icon" variant="secondary" disabled>
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function GenreRow({
  active,
  onSelect,
}: {
  active: string
  onSelect: (genre: string) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-1 flex-wrap gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => onSelect(genre)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              active === genre
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/70',
            )}
          >
            {genre}
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="shrink-0 gap-1">
        View All
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  )
}

type RowItem = {
  addon: CatalogRow['addon']
  show: AnimePreview
}

function AddonCardRow({ row }: { row: CatalogRow }) {
  if (row.error) {
    return (
      <section>
        <SectionHeader title={`${addonName(row.addon)} Anime`} />
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {row.error}
        </div>
      </section>
    )
  }

  return (
    <CardRow
      title={`${addonName(row.addon)} Anime`}
      shows={row.shows.map((show) => ({ addon: row.addon, show }))}
    />
  )
}

function CardRow({ title, shows }: { title: string; shows: RowItem[] }) {
  if (shows.length === 0) return null

  return (
    <section>
      <SectionHeader title={title} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {shows.slice(0, 8).map((item) => (
          <ShowCard
            key={`${item.addon.id}:${item.show.id}`}
            addon={item.addon}
            show={item.show}
          />
        ))}
      </div>
    </section>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground"
      >
        View All
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  )
}

function ShowCard({
  addon,
  show,
}: {
  addon: CatalogRow['addon']
  show: AnimePreview
}) {
  const thumb = show.poster ?? show.banner
  const score =
    typeof show.score === 'number' && Number.isFinite(show.score)
      ? formatScore(show.score)
      : null

  return (
    <Link
      to="/show/$id"
      params={{ id: show.id }}
      search={{ addon_id: addon.id }}
      className="group flex flex-col gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
        {thumb ? (
          <img
            src={thumb}
            alt={show.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center px-3 text-center text-xs text-muted-foreground">
            {show.title}
          </div>
        )}
        {score && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {score}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="truncate text-sm font-medium">{show.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[show.year ?? null, addonName(addon)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  )
}

function formatScore(score: number) {
  if (score > 10) return (score / 10).toFixed(1)
  return score.toFixed(1)
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
      <div className="rounded-lg border bg-card/30 px-4 py-3 text-sm text-muted-foreground">
        Keep typing to search.
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
        Searching...
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border bg-card/30 px-4 py-3 text-sm text-muted-foreground">
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
            {results.length} matches across your addons
          </p>
        </div>
        {isSearching && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {results.map((result) => (
          <ShowCard
            key={`${result.addon.id}:${result.item.id}`}
            addon={result.addon}
            show={result.item}
          />
        ))}
      </div>
    </section>
  )
}

export type { AnimeCatalogData, WatchingShow }
