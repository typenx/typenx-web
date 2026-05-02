import * as React from 'react'
import {
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  Play,
  Star,
  Users,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { withAuthRedirect } from '#/lib/loaders'
import { isTypenxApiError, typenx } from '#/sdk'
import type { AnimeMetadata, EpisodeMetadata } from '#/sdk'

export const Route = createFileRoute('/_authed/show/$id')({
  validateSearch: (
    search,
  ): { addon_id?: string; season?: number } => ({
    addon_id:
      typeof search.addon_id === 'string' ? search.addon_id : undefined,
    season:
      typeof search.season === 'number' && Number.isFinite(search.season)
        ? search.season
        : undefined,
  }),
  loaderDeps: ({ search }) => ({ addonId: search.addon_id }),
  loader: ({ params, deps, location }) =>
    withAuthRedirect(async () => {
      try {
        return await typenx.catalog.anime(params.id, deps.addonId)
      } catch (err) {
        if (isTypenxApiError(err) && err.status === 404) {
          throw notFound()
        }
        throw err
      }
    }, location.href),
  staleTime: 60_000,
  gcTime: 30 * 60_000,
  component: ShowDetailPage,
  pendingComponent: ShowPending,
  errorComponent: ShowError,
  notFoundComponent: ShowNotFound,
})

function ShowDetailPage() {
  const show = Route.useLoaderData()
  return <ShowView show={show} />
}

function ShowPending() {
  return (
    <div className="grid min-h-[50vh] place-items-center px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading show...
      </div>
    </div>
  )
}

function ShowError({ error }: { error: Error }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/anime">
          <ArrowLeft />
          Back
        </Link>
      </Button>
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error.message || 'Unable to load show details'}
      </div>
    </div>
  )
}

function ShowNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/anime">
          <ArrowLeft />
          Back
        </Link>
      </Button>
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Show not found
      </div>
    </div>
  )
}

function ShowView({ show }: { show: AnimeMetadata }) {
  const navigate = useNavigate({ from: Route.fullPath })
  const search = Route.useSearch()
  const poster = show.poster
  const banner = show.banner ?? show.poster
  const description = show.description ?? show.synopsis
  const seasons = React.useMemo(
    () => groupBySeason(show.episodes),
    [show.episodes],
  )
  const hasMultipleSeasons = seasons.length > 1
  const firstSeasonNumber = seasons.at(0)?.number ?? 1
  const activeSeason = search.season ?? firstSeasonNumber
  const activeEpisodes =
    seasons.find((s) => s.number === activeSeason)?.episodes ??
    seasons.at(0)?.episodes ??
    []

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden bg-muted">
        {banner ? (
          <img
            src={banner}
            alt=""
            className="h-full w-full object-cover opacity-45"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/85 to-background" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-6 pb-16">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/anime">
            <ArrowLeft />
            Back
          </Link>
        </Button>

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="w-44 shrink-0 self-start overflow-hidden rounded-xl bg-muted shadow-2xl ring-1 ring-border/60">
            <div className="aspect-[2/3] w-full">
              {poster ? (
                <img
                  src={poster}
                  alt={show.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center p-4 text-center text-sm text-muted-foreground">
                  {show.title}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 pt-2 sm:pt-12">
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">
              {show.title}
            </h1>
            {show.original_title && show.original_title !== show.title && (
              <p className="text-sm text-muted-foreground">
                {show.original_title}
              </p>
            )}

            <MetaStrip show={show} />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="lg" className="gap-2">
                <Play className="fill-current" />
                Play
              </Button>
              {show.site_url && (
                <Button size="lg" variant="secondary" asChild>
                  <a href={show.site_url} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Source
                  </a>
                </Button>
              )}
            </div>

            <TagList items={show.genres} variant="secondary" className="mt-4" />
          </div>
        </div>

        {description && (
          <p className="mt-10 max-w-4xl whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {description}
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
          <ShowFacts show={show} />

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Episodes
                </h2>
                <p className="text-xs text-muted-foreground">
                  {hasMultipleSeasons
                    ? `${activeEpisodes.length} in season ${activeSeason} · ${show.episodes.length} total`
                    : `${show.episodes.length} total`}
                </p>
              </div>
              {hasMultipleSeasons && (
                <Select
                  value={String(activeSeason)}
                  onValueChange={(value) =>
                    navigate({
                      search: (prev) => ({ ...prev, season: Number(value) }),
                      replace: true,
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem
                        key={season.number}
                        value={String(season.number)}
                      >
                        Season {season.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {activeEpisodes.length > 0 ? (
              <ItemGroup className="gap-0 overflow-hidden rounded-xl border border-border bg-card/40 [&>[data-slot=item]+[data-slot=item]]:border-t [&>[data-slot=item]]:rounded-none [&>[data-slot=item]]:border-x-0 [&>[data-slot=item]]:border-y-0">
                {activeEpisodes.map((episode) => (
                  <EpisodeRow key={episode.id} episode={episode} />
                ))}
              </ItemGroup>
            ) : (
              <div className="rounded-xl border border-border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
                No episode metadata is available from this addon.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function MetaStrip({ show }: { show: AnimeMetadata }) {
  const items = [
    show.season_year ?? show.year,
    show.season ? titleCase(show.season) : null,
    show.status ? titleCase(show.status.replaceAll('_', ' ')) : null,
    show.episode_count
      ? `${show.episode_count} episodes`
      : show.episodes.length
        ? `${show.episodes.length} episodes`
        : null,
    show.duration_minutes ? `${show.duration_minutes} min` : null,
  ].filter(Boolean)

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {index > 0 && <span aria-hidden>·</span>}
          <span>{item}</span>
        </React.Fragment>
      ))}
      {show.score && (
        <>
          {items.length > 0 && <span aria-hidden>·</span>}
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-current" />
            {show.score.toFixed(1)}
          </span>
        </>
      )}
    </div>
  )
}

function ShowFacts({ show }: { show: AnimeMetadata }) {
  return (
    <aside className="flex flex-col gap-6">
      <FactGroup title="Details">
        <FactRow label="Source" value={formatValue(show.source)} />
        <FactRow label="Rating" value={formatValue(show.rating)} />
        <FactRow label="Rank" value={show.rank ? `#${show.rank}` : null} />
        <FactRow
          label="Popularity"
          value={show.popularity ? show.popularity.toLocaleString() : null}
        />
        <FactRow label="Country" value={show.country_of_origin} />
        <FactRow label="Started" value={formatDate(show.start_date)} />
        <FactRow label="Ended" value={formatDate(show.end_date)} />
      </FactGroup>

      <FactGroup title="Creators">
        <ChipBlock label="Authors" items={show.authors} />
        <ChipBlock label="Studios" items={show.studios} />
        <StaffList staff={show.staff} />
      </FactGroup>

      <FactGroup title="Tags">
        <TagList items={show.tags} variant="outline" />
      </FactGroup>

      <FactGroup title="Alternative Titles">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          {show.alternative_titles.length > 0 ? (
            show.alternative_titles.slice(0, 8).map((title) => (
              <span key={title} className="leading-relaxed">
                {title}
              </span>
            ))
          ) : (
            <span>None provided</span>
          )}
        </div>
      </FactGroup>

      {show.external_links.length > 0 && (
        <FactGroup title="Links">
          <div className="flex flex-col gap-2">
            {show.external_links.slice(0, 6).map((link) => (
              <a
                key={`${link.site}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                {link.site}
              </a>
            ))}
          </div>
        </FactGroup>
      )}
    </aside>
  )
}

function FactGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function FactRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || 'Unknown'}</span>
    </div>
  )
}

function ChipBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium">{label}</p>
      <TagList items={items} variant="secondary" />
    </div>
  )
}

function StaffList({ staff }: { staff: AnimeMetadata['staff'] }) {
  if (staff.length === 0) return null

  return (
    <div>
      <p className="mb-2 text-xs font-medium">Staff</p>
      <div className="flex flex-col gap-2">
        {staff.slice(0, 6).map((credit) => (
          <div key={`${credit.name}-${credit.role}`} className="text-xs">
            <p className="font-medium">{credit.name}</p>
            {credit.role && (
              <p className="text-muted-foreground">{credit.role}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TagList({
  items,
  variant,
  className,
}: {
  items: string[]
  variant: 'secondary' | 'outline'
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ''}`}>
      {items.slice(0, 14).map((item) => (
        <Badge key={item} variant={variant}>
          {formatValue(item)}
        </Badge>
      ))}
    </div>
  )
}

function EpisodeRow({ episode }: { episode: EpisodeMetadata }) {
  return (
    <Item asChild variant="outline" className="group cursor-pointer">
      <button type="button">
        <ItemMedia>
          {episode.thumbnail ? (
            <img
              src={episode.thumbnail}
              alt=""
              className="size-14 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-sm font-semibold text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {episode.number}
            </div>
          )}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {episode.title ?? `Episode ${episode.number}`}
          </ItemTitle>
          <ItemDescription className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(episode.aired_at) ?? 'Unknown air date'}
            </span>
            {episode.duration_minutes && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {episode.duration_minutes} min
              </span>
            )}
            {episode.source && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" />
                {episode.source}
              </span>
            )}
          </ItemDescription>
        </ItemContent>
        <Play className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </button>
    </Item>
  )
}

function groupBySeason(episodes: EpisodeMetadata[]) {
  const map = new Map<number, EpisodeMetadata[]>()
  for (const episode of episodes) {
    const number = episode.season_number ?? episode.season ?? 1
    const list = map.get(number)
    if (list) {
      list.push(episode)
    } else {
      map.set(number, [episode])
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([number, list]) => ({
      number,
      episodes: list.sort((a, b) => a.number - b.number),
    }))
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatValue(value: string | null | undefined) {
  if (!value) return null
  return titleCase(value.replaceAll('_', ' '))
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
