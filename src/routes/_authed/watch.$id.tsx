import * as React from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ChevronDown, Loader2, Play, Server } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { VideoPlayer } from '#/components/custom/video-player'
import type {
  AudioOption,
  QualityOption,
  SubtitleCountry,
} from '#/components/custom/video-player'
import {
  getGuestProgress,
  isGuestMode,
  saveGuestProgress,
} from '#/lib/guest'
import { typenx } from '#/sdk'
import type { AddonRegistration, VideoStream, WatchProgress } from '#/sdk'

export const Route = createFileRoute('/_authed/watch/$id')({
  validateSearch: (
    search,
  ): {
    show_id?: string
    addon_id?: string
    season?: number
    episode?: number
    title?: string
    show?: string
  } => ({
    show_id: typeof search.show_id === 'string' ? search.show_id : undefined,
    addon_id: typeof search.addon_id === 'string' ? search.addon_id : undefined,
    season:
      typeof search.season === 'number' && Number.isFinite(search.season)
        ? search.season
        : undefined,
    episode:
      typeof search.episode === 'number' && Number.isFinite(search.episode)
        ? search.episode
        : undefined,
    title: typeof search.title === 'string' ? search.title : undefined,
    show: typeof search.show === 'string' ? search.show : undefined,
  }),
  component: WatchPage,
})

const AUDIO_TRACKS: Array<AudioOption> = [
  { id: 'jpn', language: 'Japanese', label: 'Original' },
  { id: 'eng', language: 'English', label: 'Dub' },
  { id: 'spa', language: 'Spanish', label: 'Latam dub' },
  { id: 'por', language: 'Portuguese', label: 'BR dub' },
  { id: 'fra', language: 'French', label: 'Dub' },
]

const SAMPLE_VTT = `WEBVTT

00:00:00.500 --> 00:00:06.000
Welcome to the typenx test player.

00:00:06.500 --> 00:00:12.000
Subtitles are streaming from a local Blob URL.

00:00:13.000 --> 00:00:20.000
Switch tracks from the captions menu to test selection.
`

function buildSubtitles(blobUrl: string): Array<SubtitleCountry> {
  return [
    {
      code: 'us',
      name: 'United States',
      tracks: [
        { id: 'us-en', label: 'English', src: blobUrl },
        { id: 'us-en-cc', label: 'English [CC]', src: blobUrl },
      ],
    },
    {
      code: 'gb',
      name: 'United Kingdom',
      tracks: [{ id: 'gb-en', label: 'English (UK)' }],
    },
    {
      code: 'jp',
      name: 'Japan',
      tracks: [
        { id: 'jp-ja', label: 'Japanese' },
        { id: 'jp-ja-forced', label: 'Japanese (forced)' },
      ],
    },
    {
      code: 'br',
      name: 'Brazil',
      tracks: [{ id: 'br-pt', label: 'Português (Brasil)' }],
    },
    {
      code: 'es',
      name: 'Spain',
      tracks: [{ id: 'es-es', label: 'Español' }],
    },
    {
      code: 'fr',
      name: 'France',
      tracks: [{ id: 'fr-fr', label: 'Français' }],
    },
    {
      code: 'de',
      name: 'Germany',
      tracks: [{ id: 'de-de', label: 'Deutsch' }],
    },
  ]
}

function WatchPage() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()

  const [vttUrl, setVttUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    const blob = new Blob([SAMPLE_VTT], { type: 'text/vtt' })
    const url = URL.createObjectURL(blob)
    setVttUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [])

  const subtitleCountries = React.useMemo(
    () => (vttUrl ? buildSubtitles(vttUrl) : []),
    [vttUrl],
  )
  const animeId = search.show_id ?? params.id
  const episodeId = params.id
  const guestProgress = getGuestProgress(animeId, episodeId)
  const [databaseProgress, setDatabaseProgress] =
    React.useState<WatchProgress | null>(null)
  const [qualities, setQualities] = React.useState<Array<QualityOption>>([])
  const [streams, setStreams] = React.useState<Array<VideoStream>>([])
  const [selectedSourceIndex, setSelectedSourceIndex] =
    React.useState<number | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = React.useState(true)
  const [videoError, setVideoError] = React.useState<string | null>(null)
  const [sourceSubtitles, setSourceSubtitles] = React.useState<Array<SubtitleCountry>>([])
  const progressTimerRef = React.useRef<number | null>(null)
  const latestProgressRef = React.useRef<{
    anime_id: string
    anime_title: string | null
    episode_id: string
    episode_number: number | null
    position_seconds: number
    duration_seconds: number | null
    completed: boolean
  } | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadVideoSources() {
      try {
        setIsLoadingVideo(true)
        setVideoError(null)
        const addons = await typenx.addons.list()
        const addon = pickVideoAddon(addons)
        if (!addon) {
          setVideoError('No video source addon is enabled.')
          setQualities([])
          setStreams([])
          setSelectedSourceIndex(null)
          setSourceSubtitles([])
          return
        }

        const response = await typenx.catalog.videos({
          addon_id: addon.id,
          anime_id: animeId,
          anime_title: search.show ?? null,
          episode_id: episodeId,
          episode_title: search.title ?? null,
          episode_number: search.episode ?? null,
          season_number: search.season ?? null,
        })

        if (cancelled) return
        if (response.streams.length === 0) {
          setVideoError(`${addon.manifest?.name ?? 'Video addon'} returned no streams.`)
          setQualities([])
          setStreams([])
          setSelectedSourceIndex(null)
          setSourceSubtitles([])
          return
        }

        setStreams(response.streams)
        setQualities(toQualityOptions(response.streams))
        setSelectedSourceIndex(null)
        setSourceSubtitles(toSubtitleCountries(response.subtitles ?? []))
        setVideoError(null)
      } catch (err) {
        if (!cancelled) {
          setVideoError(err instanceof Error ? err.message : 'Unable to load video source.')
          setQualities([])
          setStreams([])
          setSelectedSourceIndex(null)
          setSourceSubtitles([])
        }
      } finally {
        if (!cancelled) setIsLoadingVideo(false)
      }
    }

    void loadVideoSources()
    return () => {
      cancelled = true
    }
  }, [animeId, episodeId, search.episode, search.season, search.show, search.title])

  React.useEffect(() => {
    let cancelled = false

    async function loadSavedProgress() {
      try {
        const rows = await typenx.me.progress()
        if (cancelled) return
        setDatabaseProgress(
          rows.find(
            (row) => row.anime_id === animeId && row.episode_id === episodeId,
          ) ?? null,
        )
      } catch {
        if (!cancelled) setDatabaseProgress(null)
      }
    }

    void loadSavedProgress()
    return () => {
      cancelled = true
    }
  }, [animeId, episodeId])

  const persistProgress = React.useCallback(
    (progress: {
      position_seconds: number
      duration_seconds: number | null
      completed: boolean
    }) => {
      const payload = {
        anime_id: animeId,
        anime_title: search.show ?? null,
        episode_id: episodeId,
        episode_number: search.episode ?? null,
        ...progress,
      }
      latestProgressRef.current = payload

      if (isGuestMode()) {
        saveGuestProgress(payload)
      }

      if (progressTimerRef.current !== null) {
        window.clearTimeout(progressTimerRef.current)
      }
      progressTimerRef.current = window.setTimeout(() => {
        void typenx.me.updateProgress(payload).catch(() => {
          /* Browser-local guest progress remains the fallback. */
        })
      }, 250)
    },
    [animeId, episodeId, search.episode],
  )

  const flushProgress = React.useCallback(() => {
    const payload = latestProgressRef.current
    if (!payload) return
    if (progressTimerRef.current !== null) {
      window.clearTimeout(progressTimerRef.current)
      progressTimerRef.current = null
    }
    void typenx.me.updateProgress(payload).catch(() => {
      /* Browser-local guest progress remains the fallback. */
    })
  }, [])

  React.useEffect(
    () => () => {
      flushProgress()
    },
    [flushProgress],
  )

  const handleClose = () => {
    if (router.history.canGoBack()) {
      router.history.back()
      return
    }
    if (search.show_id) {
      void navigate({
        to: '/show/$id',
        params: { id: search.show_id },
        search: {
          addon_id: search.addon_id,
          season: search.season,
        },
      })
      return
    }
    void navigate({ to: '/anime' })
  }

  const showLabel = search.show ?? 'Now playing'
  const episodeLabel =
    search.title ??
    (search.episode ? `Episode ${search.episode}` : `Episode ${params.id}`)
  const savedProgress = pickSavedProgress(guestProgress, databaseProgress)

  if (isLoadingVideo || qualities.length === 0) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black px-6 text-white">
        <Button
          variant="ghost"
          className="absolute left-4 top-4 text-white hover:bg-white/15 hover:text-white"
          onClick={handleClose}
        >
          <ArrowLeft />
          Back
        </Button>
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          {isLoadingVideo ? (
            <>
              <Loader2 className="size-6 animate-spin text-white/70" />
              <p className="text-sm text-white/70">Finding episode streams...</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold">No stream found</p>
              <p className="text-sm text-white/70">
                {videoError ?? 'The enabled video addon did not return a playable source.'}
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  if (selectedSourceIndex === null) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black px-6 text-white">
        <Button
          variant="ghost"
          className="absolute left-4 top-4 text-white hover:bg-white/15 hover:text-white"
          onClick={handleClose}
        >
          <ArrowLeft />
          Back
        </Button>
        <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              {showLabel}
            </p>
            <h1 className="text-2xl font-semibold text-white">
              {episodeLabel}
            </h1>
            <p className="text-sm text-white/65">
              {streams.length} source{streams.length === 1 ? '' : 's'} found
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="min-w-64 gap-2 bg-white text-black hover:bg-white/90"
              >
                <Play className="fill-current" />
                Play episode
                <ChevronDown className="ml-auto size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-96 max-w-[calc(100vw-2rem)]"
            >
              <DropdownMenuLabel>Choose source</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {streams.map((stream, index) => (
                <DropdownMenuItem
                  key={stream.id}
                  className="flex cursor-pointer items-start gap-3 py-2"
                  onClick={() => setSelectedSourceIndex(index)}
                >
                  <Server className="mt-0.5 size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {sourceDisplayTitle(stream, index)}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {sourceMeta(stream)}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <VideoPlayer
      qualities={qualities}
      defaultQualityIndex={selectedSourceIndex}
      audioTracks={AUDIO_TRACKS}
      defaultAudioId="jpn"
      subtitleCountries={[...sourceSubtitles, ...subtitleCountries]}
      defaultSubtitleId={null}
      title={showLabel}
      subtitle={videoError ? `${episodeLabel} - ${videoError}` : episodeLabel}
      initialTime={savedProgress?.position_seconds ?? 0}
      onProgress={persistProgress}
      onClose={handleClose}
    />
  )
}

function toQualityOptions(streams: VideoStream[]): Array<QualityOption> {
  return streams.map((stream, index) => ({
    label: sourceDisplayTitle(stream, index),
    url: stream.url,
  }))
}

function sourceDisplayTitle(stream: VideoStream, index: number) {
  return stream.title ?? stream.quality ?? `Source ${index + 1}`
}

function sourceMeta(stream: VideoStream) {
  return [
    stream.quality,
    stream.format?.toUpperCase(),
    stream.audio_language,
  ]
    .filter(Boolean)
    .join(' / ') || 'Video source'
}

function pickVideoAddon(addons: AddonRegistration[]) {
  return addons.find(
    (addon) =>
      addon.enabled &&
      addon.manifest?.resources.includes('video_sources') &&
      addon.manifest.id === 'typenx-addon-nxvideo',
  ) ?? addons.find(
    (addon) =>
      addon.enabled && addon.manifest?.resources.includes('video_sources'),
  )
}

function toSubtitleCountries(
  subtitles: Array<{
    id: string
    label: string
    language?: string | null
    url: string
  }>,
): Array<SubtitleCountry> {
  const grouped = new Map<string, SubtitleCountry>()
  for (const subtitle of subtitles) {
    const code = subtitle.language ?? 'und'
    const country = grouped.get(code) ?? {
      code,
      name: languageName(code),
      tracks: [],
    }
    country.tracks.push({
      id: subtitle.id,
      label: subtitle.label,
      src: subtitle.url,
    })
    grouped.set(code, country)
  }
  return [...grouped.values()]
}

function languageName(code: string) {
  if (code === 'und') return 'Subtitles'
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}

function pickSavedProgress(
  guestProgress: ReturnType<typeof getGuestProgress>,
  databaseProgress: WatchProgress | null,
) {
  if (!guestProgress) return databaseProgress
  if (!databaseProgress) return guestProgress
  return new Date(databaseProgress.updated_at).getTime() >
    new Date(guestProgress.updated_at).getTime()
    ? databaseProgress
    : guestProgress
}
