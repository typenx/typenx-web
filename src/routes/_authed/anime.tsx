import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { useAuth } from '#/components/auth-provider'
import { Button } from '#/components/ui/button'
import { typenx, type AnimePreview } from '#/sdk'

export const Route = createFileRoute('/_authed/anime')({ component: AnimePage })

function AnimePage() {
  const { user } = useAuth()
  const [shows, setShows] = React.useState<AnimePreview[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const display = user?.display_name ?? 'guest'

  React.useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        setIsLoading(true)
        const response = await typenx.catalog.catalogs({
          catalog_id: 'popular',
          limit: 24,
        })
        if (!cancelled) {
          setShows(response.items)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setShows([])
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
          Browse anime from your configured Typenx addons.
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

      {!isLoading && !error && shows.length === 0 && (
        <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
          No anime came back from the configured addons.
        </div>
      )}

      {!isLoading && !error && shows.length > 0 && (
        <ShowRow
          title="Popular Anime"
          caption="Served by your active addon stack."
          shows={shows}
        />
      )}
    </div>
  )
}

function ShowRow({
  title,
  caption,
  shows,
}: {
  title: string
  caption: string
  shows: AnimePreview[]
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{caption}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          See all
          <ChevronRight />
        </Button>
      </div>

      <div className="-mx-6 overflow-x-auto px-6 pb-3 [scrollbar-width:thin]">
        <div className="flex gap-4">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowCard({ show }: { show: AnimePreview }) {
  return (
    <button
      type="button"
      className="group flex w-40 shrink-0 flex-col text-left transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
