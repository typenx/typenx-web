import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Play, Star } from 'lucide-react'

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
import type { AnimeMetadata, EpisodeMetadata } from '#/sdk'

export const Route = createFileRoute('/_authed/show/$id')({
  component: ShowDetailPage,
})

function ShowDetailPage() {
  const { id } = Route.useParams()
  const show = mockShow(id)
  const banner = `https://picsum.photos/seed/typenx-banner-${id}/1600/600`
  const poster =
    show.poster ?? `https://picsum.photos/seed/typenx-${id}/240/360`

  const seasons = React.useMemo(() => groupBySeason(show.episodes), [
    show.episodes,
  ])
  const hasMultipleSeasons = seasons.length > 1
  const [activeSeason, setActiveSeason] = React.useState<number>(
    seasons.at(0)?.number ?? 1,
  )
  const activeEpisodes = React.useMemo(
    () =>
      seasons.find((s) => s.number === activeSeason)?.episodes ??
      seasons.at(0)?.episodes ??
      [],
    [seasons, activeSeason],
  )

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden">
        <img
          src={banner}
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-6 pb-16">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/anime">
            <ArrowLeft />
            Back
          </Link>
        </Button>

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="w-44 shrink-0 self-start overflow-hidden rounded-xl shadow-2xl ring-1 ring-border/60">
            <div className="aspect-[2/3] w-full bg-muted">
              <img
                src={poster}
                alt={show.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 pt-2 sm:pt-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {show.title}
            </h1>
            {show.original_title && (
              <p className="text-sm text-muted-foreground">
                {show.original_title}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {show.year && <span>{show.year}</span>}
              {show.year && show.status && <span aria-hidden>·</span>}
              {show.status && <span className="capitalize">{show.status}</span>}
              {show.episodes.length > 0 && <span aria-hidden>·</span>}
              <span>{show.episodes.length} episodes</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-current" />
                7.6
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="lg" className="gap-2">
                <Play className="fill-current" />
                Play
              </Button>
            </div>

            {show.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {show.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {show.synopsis && (
          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-foreground/90">
            {show.synopsis}
          </p>
        )}

        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Episodes</h2>
              <p className="text-xs text-muted-foreground">
                {hasMultipleSeasons
                  ? `${activeEpisodes.length} in season ${activeSeason} · ${show.episodes.length} total`
                  : `${show.episodes.length} total`}
              </p>
            </div>
            {hasMultipleSeasons && (
              <Select
                value={String(activeSeason)}
                onValueChange={(v) => setActiveSeason(Number(v))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season.number} value={String(season.number)}>
                      Season {season.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <ItemGroup className="gap-0 overflow-hidden rounded-xl border border-border bg-card/40 [&>[data-slot=item]+[data-slot=item]]:border-t [&>[data-slot=item]]:rounded-none [&>[data-slot=item]]:border-x-0 [&>[data-slot=item]]:border-y-0">
            {activeEpisodes.map((episode) => (
              <EpisodeRow key={episode.id} episode={episode} />
            ))}
          </ItemGroup>
        </section>
      </div>
    </div>
  )
}

function EpisodeRow({ episode }: { episode: EpisodeMetadata }) {
  return (
    <Item asChild variant="outline" className="group cursor-pointer">
      <button type="button">
        <ItemMedia>
          <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-sm font-semibold text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {episode.number}
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {episode.title ?? `Episode ${episode.number}`}
          </ItemTitle>
          {episode.synopsis && (
            <ItemDescription className="truncate">
              {episode.synopsis}
            </ItemDescription>
          )}
        </ItemContent>
        {episode.aired_at && (
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            {formatDate(episode.aired_at)}
          </span>
        )}
        <Play className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </button>
    </Item>
  )
}

function groupBySeason(episodes: EpisodeMetadata[]) {
  const map = new Map<number, EpisodeMetadata[]>()
  for (const episode of episodes) {
    const number = episode.season ?? 1
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

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const SEASON_TITLES: Record<number, string[]> = {
  1: [
    'The Awakening',
    'Crossing Paths',
    'Echoes Beneath',
    'A Quiet Resolve',
    'The Long Way Home',
    'Where Stars Sleep',
    'Threads of Memory',
    'Beneath the Surface',
    'Ash and Embers',
    'The Final Hour',
    'Fragments',
    'Daybreak',
  ],
  2: [
    'Return Flight',
    'Borrowed Sky',
    'A Map for the Lost',
    'Saltwind',
    'No Quiet Dawn',
    'The Listening Tower',
    'Iron Choirs',
    'A Hand in the Rain',
    'Slow Storms',
    'The Weight of Names',
    'When Forests Speak',
    'Northbound',
    'Hollow Bells',
  ],
  3: [
    'After the Tide',
    'Last Letters Home',
    'Featherless',
    'A City We Imagined',
    'Dust on the Glass',
    'The Long Hum',
    'Open Waters',
    'Lighthouse',
  ],
}

function mockShow(id: string): AnimeMetadata {
  const episodes: EpisodeMetadata[] = []
  let cursor = new Date(2023, 0, 7)
  for (const [seasonStr, titles] of Object.entries(SEASON_TITLES)) {
    const season = Number(seasonStr)
    titles.forEach((title, i) => {
      episodes.push({
        id: `${id}-s${season}-ep-${i + 1}`,
        anime_id: id,
        number: i + 1,
        season,
        title,
        synopsis: `A short tease for "${title}" — replace with real episode data later.`,
        thumbnail: null,
        aired_at: new Date(cursor.getTime() + i * 7 * 86_400_000).toISOString(),
      })
    })
    cursor = new Date(cursor.getTime() + (titles.length + 24) * 86_400_000)
  }

  return {
    id,
    title: 'Crimson Sky',
    original_title: 'クリムゾン・スカイ',
    synopsis:
      'After a catastrophic event tears the world apart, a young pilot finds herself bound to an ancient relic that can rewrite the sky itself. As rival empires race to claim it, she must decide whether the cost of saving everyone is worth the future she might lose. A sweeping story about flight, memory, and the people we choose to come home to.',
    poster: null,
    banner: null,
    year: 2025,
    status: 'ongoing',
    genres: [
      'Action',
      'Adventure',
      'Drama',
      'Fantasy',
      'Mystery',
      'Sci-Fi',
      'Supernatural',
    ],
    episodes,
    updated_at: new Date().toISOString(),
  }
}
