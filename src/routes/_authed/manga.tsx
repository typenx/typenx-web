import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { BookOpen, Info, Loader2, Search } from 'lucide-react'

import { withAuthRedirect } from '#/lib/loaders'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import {
  addonName,
  getCachedMangaCatalogSearch,
  loadMangaCatalog,
  searchMangaCatalog,
} from '#/sdk/manga-catalog'
import type { MangaCatalogData } from '#/sdk/manga-catalog'
import type { AddonSearchResult, AnimePreview } from '#/sdk'

export const Route = createFileRoute('/_authed/manga')({
  validateSearch: (search): { q?: string } => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  loader: ({ location }) =>
    withAuthRedirect(() => loadMangaCatalog(), location.href),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  pendingComponent: MangaPending,
  errorComponent: MangaError,
  component: MangaPage,
})

function MangaPage() {
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
      const cached = getCachedMangaCatalogSearch(trimmedQuery)
      if (cached) {
        setSearchResults(cached)
        setSearchError(null)
        setIsSearching(false)
        return
      }

      try {
        setIsSearching(true)
        const results = await searchMangaCatalog(trimmedQuery)
        if (!cancelled) {
          setSearchResults(results)
          setSearchError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setSearchResults([])
          setSearchError(
            err instanceof Error ? err.message : 'Unable to search manga',
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
      <MangaShell>
        <SearchResults
          query={trimmedQuery}
          results={searchResults}
          isSearching={isSearching}
          error={searchError}
        />
      </MangaShell>
    )
  }

  return (
    <MangaShell>
      {data.rows.length === 0 ? (
        <EmptyMangaState />
      ) : (
        <div className="space-y-8">
          {data.rows.map((row) => (
            <MangaRow
              key={row.addon.id}
              title={addonName(row.addon)}
              shows={row.shows}
              addonId={row.addon.id}
              error={row.error}
            />
          ))}
        </div>
      )}
    </MangaShell>
  )
}

function MangaShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate({ from: Route.fullPath })
  const { q = '' } = Route.useSearch()
  const [value, setValue] = React.useState(q)

  React.useEffect(() => setValue(q), [q])

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Manga</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manga, manhwa, manhua, and light-novel metadata from enabled Typenx
            addons.
          </p>
        </div>
        <form
          className="relative w-full sm:max-w-sm"
          onSubmit={(event) => {
            event.preventDefault()
            void navigate({
              search: value.trim() ? { q: value.trim() } : {},
            })
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Search manga..."
            type="search"
          />
        </form>
      </section>
      {children}
    </main>
  )
}

function MangaRow({
  title,
  shows,
  addonId,
  error,
}: {
  title: string
  shows: AnimePreview[]
  addonId: string
  error: string | null
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{title}</h2>
        {error ? <Badge variant="destructive">Unavailable</Badge> : null}
      </div>
      {error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : shows.length > 0 ? (
        <MangaGrid shows={shows} addonId={addonId} />
      ) : (
        <p className="text-sm text-muted-foreground">
          This addon did not return manga for its default catalog.
        </p>
      )}
    </section>
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
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">Search results for “{query}”</h2>
        {isSearching ? <Loader2 className="size-4 animate-spin" /> : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!error && results.length > 0 ? (
        <MangaSearchGrid results={results} />
      ) : null}
      {!error && !isSearching && results.length === 0 ? (
        <p className="text-sm text-muted-foreground">No manga results found.</p>
      ) : null}
    </section>
  )
}

function MangaGrid({
  shows,
  addonId,
}: {
  shows: AnimePreview[]
  addonId: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {shows.map((show) => (
        <MangaCard key={show.id} show={show} addonId={addonId} />
      ))}
    </div>
  )
}

function MangaSearchGrid({ results }: { results: AddonSearchResult[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {results.map((result) => (
        <MangaCard
          key={`${result.addon.id}:${result.item.id}`}
          show={result.item}
          addonId={result.addon.id}
        />
      ))}
    </div>
  )
}

function MangaCard({
  show,
  addonId,
}: {
  show: AnimePreview
  addonId: string
}) {
  return (
    <Link
      to="/show/$id"
      params={{ id: show.id }}
      search={{ addon_id: addonId, content_type: 'manga' }}
      className="group min-w-0"
    >
      <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted">
        {show.poster ? (
          <img
            src={show.poster}
            alt=""
            className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <BookOpen className="size-8" />
          </div>
        )}
      </div>
      <div className="mt-2 min-w-0">
        <p className="truncate text-sm font-medium">{show.title}</p>
        <p className="text-xs text-muted-foreground">
          {show.year ?? show.content_type.replace('_', ' ')}
        </p>
      </div>
    </Link>
  )
}

function EmptyMangaState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-md border border-dashed px-6 text-center">
      <Info className="mb-3 size-6 text-muted-foreground" />
      <h2 className="text-lg font-medium">No manga addons enabled</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Typenx Core is manga-ready, but the Manga page needs an enabled addon
        whose manifest exposes a manga catalog.
      </p>
      <Button asChild className="mt-4">
        <Link to="/addons">Manage addons</Link>
      </Button>
    </div>
  )
}

function MangaPending() {
  return (
    <MangaShell>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-1 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </MangaShell>
  )
}

function MangaError({ error }: { error: Error }) {
  return (
    <MangaShell>
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    </MangaShell>
  )
}
