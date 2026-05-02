import * as React from 'react'
import {
  Link,
  createFileRoute,
  notFound,
  useNavigate,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  ExternalLink,
  Film,
  Loader2,
  Plus,
  Play,
  Star,
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { withAuthRedirect } from '#/lib/loaders'
import { isTypenxApiError, typenx } from '#/sdk'
import type { AnimeMetadata, EpisodeMetadata } from '#/sdk'

export const Route = createFileRoute('/_authed/show/$id')({
  validateSearch: (
    search,
  ): {
    addon_id?: string
    season?: number
    page?: number
    order?: 'asc' | 'desc'
  } => ({
    addon_id:
      typeof search.addon_id === 'string' ? search.addon_id : undefined,
    season:
      typeof search.season === 'number' && Number.isFinite(search.season)
        ? search.season
        : undefined,
    page:
      typeof search.page === 'number' && Number.isFinite(search.page)
        ? Math.max(1, Math.floor(search.page))
        : undefined,
    order: search.order === 'desc' ? 'desc' : undefined,
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
  const rootNavigate = useNavigate()
  const search = Route.useSearch()
  const poster = show.poster
  const banner = show.banner ?? show.poster
  const description = show.description ?? show.synopsis
  const seasons = React.useMemo(
    () => groupBySeason(show.episodes),
    [show.episodes],
  )
  const hasSeasons = seasons.length > 0
  const hasMultipleSeasons = seasons.length > 1
  const firstSeasonNumber = seasons.at(0)?.number ?? 1
  const activeSeason = search.season ?? firstSeasonNumber
  const seasonEpisodes =
    seasons.find((s) => s.number === activeSeason)?.episodes ??
    seasons.at(0)?.episodes ??
    []

  const order = search.order ?? 'asc'
  const activeEpisodes = React.useMemo(() => {
    if (order === 'desc') return [...seasonEpisodes].reverse()
    return seasonEpisodes
  }, [seasonEpisodes, order])

  const PAGE_SIZE = 10
  const totalPages = Math.max(1, Math.ceil(activeEpisodes.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, search.page ?? 1), totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visibleEpisodes = activeEpisodes.slice(pageStart, pageStart + PAGE_SIZE)
  const goToPage = (page: number) =>
    navigate({
      search: (prev) => ({ ...prev, page: page === 1 ? undefined : page }),
      replace: true,
    })

  const handleSelectSeason = (value: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        season: Number(value),
        page: undefined,
      }),
      replace: true,
    })

  const playFirstEpisode = () => {
    if (seasonEpisodes.length === 0) return
    const first = seasonEpisodes[0]
    void rootNavigate({
      to: '/watch/$id',
      params: { id: first.id },
      search: {
        show_id: show.id,
        show: show.title,
        addon_id: search.addon_id,
        season: first.season_number ?? first.season ?? undefined,
        episode: first.number,
        title: first.title ?? undefined,
      },
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/anime">
          <ArrowLeft />
          Back
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="w-44 shrink-0 self-start overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
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

            <div className="flex flex-1 flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {show.title}
              </h1>
              {show.original_title && show.original_title !== show.title && (
                <p className="text-sm text-muted-foreground">
                  {show.original_title}
                </p>
              )}

              <RatingStrip show={show} />

              {show.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {show.genres.slice(0, 8).map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {description && (
                <p className="mt-1 line-clamp-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  size="lg"
                  className="gap-2"
                  disabled={seasonEpisodes.length === 0}
                  onClick={playFirstEpisode}
                >
                  <Play className="fill-current" />
                  Watch Now
                </Button>
                <Button size="lg" variant="secondary" disabled className="gap-2">
                  <Plus />
                  Add to List
                </Button>
                {show.trailer_url && (
                  <Button size="lg" variant="secondary" asChild className="gap-2">
                    <a href={show.trailer_url} target="_blank" rel="noreferrer">
                      <Film />
                      Trailer
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="episodes" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
              <TabsTrigger value="characters">Characters</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <OverviewTab show={show} />
            </TabsContent>

            <TabsContent value="episodes" className="mt-4">
              <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {hasMultipleSeasons
                        ? `${activeEpisodes.length} in season ${activeSeason} · ${show.episodes.length} total`
                        : `${show.episodes.length} total`}
                      {totalPages > 1 &&
                        ` · page ${currentPage} of ${totalPages}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasSeasons && (
                      <Select
                        value={String(activeSeason)}
                        onValueChange={handleSelectSeason}
                      >
                        <SelectTrigger
                          className="w-40"
                          aria-label="Select season"
                        >
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
                    {activeEpisodes.length > 1 && (
                      <Select
                        value={order}
                        onValueChange={(value) =>
                          navigate({
                            search: (prev) => ({
                              ...prev,
                              order: value === 'desc' ? 'desc' : undefined,
                              page: undefined,
                            }),
                            replace: true,
                          })
                        }
                      >
                        <SelectTrigger className="w-36" aria-label="Sort order">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {visibleEpisodes.length > 0 ? (
                  <>
                    <ItemGroup className="gap-2">
                      {visibleEpisodes.map((episode) => (
                        <EpisodeRow
                          key={episode.id}
                          episode={episode}
                          onPlay={() =>
                            void rootNavigate({
                              to: '/watch/$id',
                              params: { id: episode.id },
                              search: {
                                show_id: show.id,
                                show: show.title,
                                addon_id: search.addon_id,
                                season:
                                  episode.season_number ??
                                  episode.season ??
                                  undefined,
                                episode: episode.number,
                                title: episode.title ?? undefined,
                              },
                            })
                          }
                        />
                      ))}
                    </ItemGroup>
                    {totalPages > 1 && (
                      <EpisodesPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                      />
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
                    No episode metadata is available from this addon.
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="characters" className="mt-4">
              <CharactersTab staff={show.staff} />
            </TabsContent>

            <TabsContent value="related" className="mt-4">
              <RelatedTab show={show} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="flex flex-col gap-4">
          <InfoCard show={show} seasonsCount={seasons.length} />
          {show.staff.length > 0 && <CastCard staff={show.staff} />}
          {show.external_links.length > 0 && (
            <LinksCard links={show.external_links} />
          )}
        </aside>
      </div>
    </div>
  )
}

function RatingStrip({ show }: { show: AnimeMetadata }) {
  const segments: React.ReactNode[] = []
  if (typeof show.score === 'number' && Number.isFinite(show.score)) {
    segments.push(
      <span
        key="score"
        className="inline-flex items-center gap-1 font-medium text-foreground"
      >
        <Star className="size-4 fill-amber-400 text-amber-400" />
        {show.score.toFixed(1)}
        {typeof show.popularity === 'number' && Number.isFinite(show.popularity)
          ? ` (${formatPopularity(show.popularity)})`
          : null}
      </span>,
    )
  }
  const year = show.season_year ?? show.year
  if (year) segments.push(<span key="year">{year}</span>)
  if (show.content_type)
    segments.push(<span key="type">{titleCase(show.content_type)}</span>)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span aria-hidden>·</span>}
          {segment}
        </React.Fragment>
      ))}
      {show.status && (
        <Badge variant="secondary" className="ml-1">
          {titleCase(show.status.replaceAll('_', ' '))}
        </Badge>
      )}
    </div>
  )
}

function OverviewTab({ show }: { show: AnimeMetadata }) {
  const description = show.description ?? show.synopsis
  return (
    <div className="flex flex-col gap-6">
      {description && (
        <p className="max-w-4xl whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {description}
        </p>
      )}
      {show.tags.length > 0 && (
        <Section title="Tags">
          <div className="flex flex-wrap gap-1.5">
            {show.tags.slice(0, 24).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </Section>
      )}
      {show.alternative_titles.length > 0 && (
        <Section title="Alternative titles">
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {show.alternative_titles.slice(0, 8).map((alt) => (
              <li key={alt}>{alt}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function CharactersTab({ staff }: { staff: AnimeMetadata['staff'] }) {
  if (staff.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
        No cast information from this addon.
      </div>
    )
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {staff.map((credit, index) => (
        <div
          key={`${credit.name}-${index}`}
          className="flex items-center gap-3 rounded-lg border bg-card/40 px-3 py-2.5"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
            {credit.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{credit.name}</p>
            {credit.role && (
              <p className="truncate text-xs text-muted-foreground">
                {credit.role}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function RelatedTab({ show }: { show: AnimeMetadata }) {
  if (show.external_links.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
        No related links from this addon.
      </div>
    )
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {show.external_links.map((link) => (
        <a
          key={`${link.site}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg border bg-card/40 px-3 py-2.5 text-sm transition-colors hover:bg-card"
        >
          <span className="font-medium">{link.site}</span>
          <ExternalLink className="size-4 text-muted-foreground" />
        </a>
      ))}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold tracking-tight">{title}</h3>
      {children}
    </section>
  )
}

function InfoCard({
  show,
  seasonsCount,
}: {
  show: AnimeMetadata
  seasonsCount: number
}) {
  const rows: Array<[string, string | null]> = [
    ['Seasons', seasonsCount > 0 ? String(seasonsCount) : null],
    [
      'Episodes',
      show.episode_count
        ? String(show.episode_count)
        : show.episodes.length
          ? String(show.episodes.length)
          : null,
    ],
    [
      'Duration',
      show.duration_minutes ? `${show.duration_minutes}m` : null,
    ],
    ['Type', formatValue(show.content_type)],
    ['Source', formatValue(show.source)],
    ['Country', show.country_of_origin],
    ['Studio', show.studios[0] ?? null],
    ['Started', formatDate(show.start_date)],
    ['Ended', formatDate(show.end_date)],
    ['Rating', formatValue(show.rating)],
  ]
  const visible = rows.filter(([, value]) => value && value !== 'Unknown')
  if (visible.length === 0) return null

  return (
    <div className="rounded-xl border bg-card/40 px-4 py-3">
      <ul className="flex flex-col gap-2 text-sm">
        {visible.map(([label, value]) => (
          <li
            key={label}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CastCard({ staff }: { staff: AnimeMetadata['staff'] }) {
  return (
    <div className="rounded-xl border bg-card/40 px-4 py-3">
      <h3 className="mb-3 text-sm font-semibold tracking-tight">Cast</h3>
      <ul className="flex flex-col gap-3">
        {staff.slice(0, 4).map((credit, index) => (
          <li
            key={`${credit.name}-${index}`}
            className="flex items-center gap-3"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {credit.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{credit.name}</p>
              {credit.role && (
                <p className="truncate text-xs text-muted-foreground">
                  {credit.role}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LinksCard({ links }: { links: AnimeMetadata['external_links'] }) {
  return (
    <div className="rounded-xl border bg-card/40 px-4 py-3">
      <h3 className="mb-3 text-sm font-semibold tracking-tight">Links</h3>
      <ul className="flex flex-col gap-2">
        {links.slice(0, 6).map((link) => (
          <li key={`${link.site}-${link.url}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3" />
              {link.site}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatPopularity(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

function EpisodesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const items = visiblePages(currentPage, totalPages)

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={currentPage === 1}
            className={
              currentPage === 1 ? 'pointer-events-none opacity-50' : undefined
            }
            onClick={(event) => {
              event.preventDefault()
              if (currentPage > 1) onPageChange(currentPage - 1)
            }}
          />
        </PaginationItem>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(item)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages
                ? 'pointer-events-none opacity-50'
                : undefined
            }
            onClick={(event) => {
              event.preventDefault()
              if (currentPage < totalPages) onPageChange(currentPage + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function visiblePages(
  current: number,
  total: number,
): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const items: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) items.push('ellipsis')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 1) items.push('ellipsis')
  items.push(total)
  return items
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

function EpisodeRow({
  episode,
  onPlay,
}: {
  episode: EpisodeMetadata
  onPlay: () => void
}) {
  return (
    <Item asChild variant="outline" className="group cursor-pointer">
      <button type="button" onClick={onPlay}>
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
