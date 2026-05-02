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
  const savedProgress = getGuestProgress(animeId, episodeId)
  const progressTimerRef = React.useRef<number | null>(null)

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

  React.useEffect(
    () => () => {
      if (progressTimerRef.current !== null) {
        window.clearTimeout(progressTimerRef.current)
      }
    },
    [],
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

  return (
    <VideoPlayer
      qualities={QUALITIES}
      defaultQualityIndex={0}
      audioTracks={AUDIO_TRACKS}
      defaultAudioId="jpn"
      subtitleCountries={subtitleCountries}
      defaultSubtitleId={null}
      title={showLabel}
      subtitle={episodeLabel}
      initialTime={savedProgress?.position_seconds ?? 0}
      onProgress={persistProgress}
      onClose={handleClose}
    />
  )
}
