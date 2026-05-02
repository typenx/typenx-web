import * as React from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'

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
import type { AddonRegistration, WatchProgress } from '#/sdk'

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

const TEST_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

const QUALITIES: Array<QualityOption> = [
  { label: '1080p', url: TEST_VIDEO_URL },
  { label: '720p', url: TEST_VIDEO_URL },
  { label: '480p', url: TEST_VIDEO_URL },
  { label: 'Auto', url: TEST_VIDEO_URL },
]

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
  const [qualities, setQualities] = React.useState<Array<QualityOption>>(QUALITIES)
  const [videoError, setVideoError] = React.useState<string | null>(null)
  const [sourceSubtitles, setSourceSubtitles] = React.useState<Array<SubtitleCountry>>([])
  const progressTimerRef = React.useRef<number | null>(null)
  const latestProgressRef = React.useRef<{
    anime_id: string
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
        const addons = await typenx.addons.list()
        const addon = pickVideoAddon(addons)
        if (!addon) {
          setVideoError('No video source addon is enabled.')
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
          return
        }

        setQualities(
          response.streams.map((stream, index) => ({
            label: stream.quality ?? stream.title ?? `Source ${index + 1}`,
            url: stream.url,
          })),
        )
        setSourceSubtitles(toSubtitleCountries(response.subtitles ?? []))
        setVideoError(null)
      } catch (err) {
        if (!cancelled) {
          setVideoError(err instanceof Error ? err.message : 'Unable to load video source.')
        }
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

  return (
    <VideoPlayer
      qualities={qualities}
      defaultQualityIndex={0}
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
