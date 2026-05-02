import * as React from 'react'
import {
  ArrowLeft,
  Captions,
  CaptionsOff,
  Check,
  ChevronLeft,
  Languages,
  Maximize,
  Minimize,
  Pause,
  Play,
  Settings,
  Square,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Slider } from '#/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export type QualityOption = {
  label: string
  url: string
}

export type AudioOption = {
  id: string
  language: string
  label?: string
}

export type SubtitleOption = {
  id: string
  label: string
  src?: string
}

export type SubtitleCountry = {
  code: string
  name: string
  tracks: SubtitleOption[]
}

export type VideoPlayerProps = {
  qualities: Array<QualityOption>
  defaultQualityIndex?: number
  audioTracks?: Array<AudioOption>
  defaultAudioId?: string
  subtitleCountries?: Array<SubtitleCountry>
  defaultSubtitleId?: string | null
  title?: string
  subtitle?: string
  poster?: string
  initialTime?: number
  onProgress?: (progress: {
    position_seconds: number
    duration_seconds: number | null
    completed: boolean
  }) => void
  onClose?: () => void
}

const HIDE_DELAY_MS = 3000

export function VideoPlayer({
  qualities,
  defaultQualityIndex = 0,
  audioTracks = [],
  defaultAudioId,
  subtitleCountries = [],
  defaultSubtitleId = null,
  title,
  subtitle,
  poster,
  initialTime = 0,
  onProgress,
  onClose,
}: VideoPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)

  const [qualityIndex, setQualityIndex] = React.useState(
    Math.min(Math.max(defaultQualityIndex, 0), Math.max(qualities.length - 1, 0)),
  )
  const [audioId, setAudioId] = React.useState<string | undefined>(
    defaultAudioId ?? audioTracks[0]?.id,
  )
  const [subtitleId, setSubtitleId] = React.useState<string | null>(
    defaultSubtitleId,
  )

  const [playing, setPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [buffered, setBuffered] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [scrubbing, setScrubbing] = React.useState(false)
  const [waiting, setWaiting] = React.useState(false)

  const hideTimerRef = React.useRef<number | null>(null)
  const lastProgressRef = React.useRef(0)
  const onProgressRef = React.useRef(onProgress)
  const appliedInitialTimeRef = React.useRef(0)

  const activeQuality = qualities[qualityIndex]

  const allSubtitles = React.useMemo(() => {
    const map = new Map<string, { country: SubtitleCountry; track: SubtitleOption }>()
    for (const country of subtitleCountries) {
      for (const track of country.tracks) {
        map.set(track.id, { country, track })
      }
    }
    return map
  }, [subtitleCountries])

  const activeSubtitle = subtitleId ? allSubtitles.get(subtitleId) : null
  const activeAudio = audioTracks.find((t) => t.id === audioId)

  React.useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const wasPlaying = !video.paused
    const time = video.currentTime
    video.src = activeQuality.url
    video.load()
    const onLoaded = () => {
      video.currentTime = time
      if (wasPlaying) void video.play().catch(() => {})
      video.removeEventListener('loadedmetadata', onLoaded)
    }
    video.addEventListener('loadedmetadata', onLoaded)
    return () => video.removeEventListener('loadedmetadata', onLoaded)
  }, [activeQuality.url])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = volume
    video.muted = muted
  }, [volume, muted])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video || initialTime <= 0) return
    if (appliedInitialTimeRef.current === initialTime) return
    if (video.currentTime > 3) return
    video.currentTime = initialTime
    setCurrentTime(initialTime)
    appliedInitialTimeRef.current = initialTime
  }, [initialTime])

  React.useEffect(() => {
    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const queueHide = React.useCallback(() => {
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => {
      setShowControls(false)
    }, HIDE_DELAY_MS)
  }, [])

  const revealControls = React.useCallback(() => {
    setShowControls(true)
    queueHide()
  }, [queueHide])

  React.useEffect(() => {
    queueHide()
    return () => {
      if (hideTimerRef.current !== null)
        window.clearTimeout(hideTimerRef.current)
    }
  }, [queueHide])

  const togglePlay = React.useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const stop = React.useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setCurrentTime(0)
  }, [])

  const seekTo = React.useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = seconds
    setCurrentTime(seconds)
  }, [])

  const toggleFullscreen = React.useCallback(async () => {
    const el = containerRef.current
    if (!el) return
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      /* ignore */
    }
  }, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
      revealControls()
      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'f' || e.key === 'F') {
        void toggleFullscreen()
      } else if (e.key === 'm' || e.key === 'M') {
        setMuted((m) => !m)
      } else if (e.key === 'ArrowRight') {
        const v = videoRef.current
        if (v) seekTo(Math.min(v.currentTime + 5, v.duration || Infinity))
      } else if (e.key === 'ArrowLeft') {
        const v = videoRef.current
        if (v) seekTo(Math.max(v.currentTime - 5, 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setVolume((vol) => Math.min(1, +(vol + 0.05).toFixed(2)))
        setMuted(false)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setVolume((vol) => Math.max(0, +(vol - 0.05).toFixed(2)))
      } else if (e.key === 'Escape' && !document.fullscreenElement && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealControls, togglePlay, toggleFullscreen, seekTo, onClose])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return
    for (const track of Array.from(video.textTracks)) {
      track.mode = track.id === subtitleId ? 'showing' : 'hidden'
    }
  }, [subtitleId, subtitleCountries])

  const onTimeUpdate = () => {
    const video = videoRef.current
    if (!video || scrubbing) return
    setCurrentTime(video.currentTime)
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1))
    }
    if (Math.abs(video.currentTime - lastProgressRef.current) >= 5) {
      emitProgress(video, false)
    }
  }

  const emitProgress = (video: HTMLVideoElement, completed: boolean) => {
    lastProgressRef.current = video.currentTime
    onProgressRef.current?.({
      position_seconds: Math.max(0, Math.floor(video.currentTime)),
      duration_seconds: Number.isFinite(video.duration)
        ? Math.floor(video.duration)
        : null,
      completed,
    })
  }

  React.useEffect(() => {
    const flushProgress = () => {
      const video = videoRef.current
      if (!video || video.currentTime <= 0) return
      emitProgress(video, video.ended)
    }

    window.addEventListener('pagehide', flushProgress)
    document.addEventListener('visibilitychange', flushProgress)
    return () => {
      flushProgress()
      window.removeEventListener('pagehide', flushProgress)
      document.removeEventListener('visibilitychange', flushProgress)
    }
  }, [])

  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-50 select-none overflow-hidden bg-black text-white',
      )}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (playing) setShowControls(false)
      }}
      onTouchStart={revealControls}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full bg-black object-contain"
        poster={poster}
        playsInline
        autoPlay
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={(e) => {
          setPlaying(false)
          emitProgress(e.currentTarget, false)
        }}
        onTimeUpdate={onTimeUpdate}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0)
          if (initialTime > 0) {
            e.currentTarget.currentTime = initialTime
            setCurrentTime(initialTime)
            appliedInitialTimeRef.current = initialTime
          }
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onEnded={(e) => {
          setPlaying(false)
          emitProgress(e.currentTarget, true)
        }}
      >
        {subtitleCountries.flatMap((country) =>
          country.tracks
            .filter((track) => track.src)
            .map((track) => (
              <track
                key={track.id}
                id={track.id}
                kind="subtitles"
                srcLang={country.code}
                label={`${country.name} – ${track.label}`}
                src={track.src}
                default={track.id === subtitleId}
              />
            )),
        )}
      </video>

      {waiting && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="size-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/70 via-transparent to-black/85 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="pointer-events-auto flex items-start gap-3 p-4 sm:p-6">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/15 hover:text-white"
              onClick={onClose}
              aria-label="Close player"
            >
              <ArrowLeft />
            </Button>
          )}
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && (
                <p className="truncate text-sm font-semibold sm:text-base">
                  {title}
                </p>
              )}
              {subtitle && (
                <p className="truncate text-xs text-white/70">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        <div className="pointer-events-auto px-4 pb-4 sm:px-6 sm:pb-6">
          <SeekBar
            currentTime={currentTime}
            duration={duration}
            buffered={buffered}
            onScrubStart={() => setScrubbing(true)}
            onScrub={(v) => setCurrentTime(v)}
            onScrubEnd={(v) => {
              setScrubbing(false)
              seekTo(v)
              const video = videoRef.current
              if (video) emitProgress(video, false)
            }}
          />

          <div className="mt-3 flex items-center gap-1 text-white sm:gap-2">
            <ControlButton
              onClick={togglePlay}
              ariaLabel={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
            </ControlButton>

            {(playing || currentTime > 0) && (
              <ControlButton onClick={stop} ariaLabel="Stop">
                <Square className="size-4" />
              </ControlButton>
            )}

            <VolumeControl
              icon={<VolumeIcon className="size-5" />}
              muted={muted}
              volume={volume}
              onMuteToggle={() => setMuted((m) => !m)}
              onVolumeChange={(v) => {
                setVolume(v)
                if (v > 0) setMuted(false)
              }}
            />

            <span className="ml-2 text-xs tabular-nums text-white/85">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {subtitleCountries.length > 0 && (
                <SubtitleMenu
                  countries={subtitleCountries}
                  selectedId={subtitleId}
                  selectedLabel={
                    activeSubtitle
                      ? `${activeSubtitle.country.name} · ${activeSubtitle.track.label}`
                      : 'Off'
                  }
                  onSelect={(id) => setSubtitleId(id)}
                />
              )}

              {audioTracks.length > 0 && (
                <AudioMenu
                  tracks={audioTracks}
                  selectedId={audioId}
                  onSelect={(id) => setAudioId(id)}
                />
              )}

              <SettingsMenu
                qualities={qualities}
                qualityIndex={qualityIndex}
                onQualityChange={setQualityIndex}
                activeQualityLabel={activeQuality.label}
                activeAudioLabel={activeAudio?.language ?? 'Default'}
                activeSubtitleLabel={
                  activeSubtitle
                    ? `${activeSubtitle.country.name} · ${activeSubtitle.track.label}`
                    : 'Off'
                }
              />

              <ControlButton
                onClick={() => void toggleFullscreen()}
                ariaLabel={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="size-5" />
                ) : (
                  <Maximize className="size-5" />
                )}
              </ControlButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlButton({
  children,
  onClick,
  ariaLabel,
  active,
}: {
  children: React.ReactNode
  onClick?: () => void
  ariaLabel: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        active && 'bg-white/15 text-white',
      )}
    >
      {children}
    </button>
  )
}

function VolumeControl({
  icon,
  muted,
  volume,
  onMuteToggle,
  onVolumeChange,
}: {
  icon: React.ReactNode
  muted: boolean
  volume: number
  onMuteToggle: () => void
  onVolumeChange: (v: number) => void
}) {
  return (
    <div className="group/vol flex items-center">
      <ControlButton
        onClick={onMuteToggle}
        ariaLabel={muted ? 'Unmute' : 'Mute'}
      >
        {icon}
      </ControlButton>
      <div className="w-0 overflow-hidden transition-[width] duration-200 ease-out group-hover/vol:w-24 group-focus-within/vol:w-24">
        <div className="px-2">
          <Slider
            value={[muted ? 0 : Math.round(volume * 100)]}
            onValueChange={([v]) => onVolumeChange(v / 100)}
            min={0}
            max={100}
            step={1}
            aria-label="Volume"
            className="[&_[data-slot=slider-track]]:bg-white/25 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white"
          />
        </div>
      </div>
    </div>
  )
}

function SeekBar({
  currentTime,
  duration,
  buffered,
  onScrubStart,
  onScrub,
  onScrubEnd,
}: {
  currentTime: number
  duration: number
  buffered: number
  onScrubStart: () => void
  onScrub: (v: number) => void
  onScrubEnd: (v: number) => void
}) {
  const max = Math.max(1, Math.floor(duration))
  const value = Math.min(Math.floor(currentTime), max)
  const bufferedPct = duration ? Math.min(100, (buffered / duration) * 100) : 0

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15"
      >
        <div
          className="h-full rounded-full bg-white/35"
          style={{ width: `${bufferedPct}%` }}
        />
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => {
          onScrubStart()
          onScrub(v)
        }}
        onValueCommit={([v]) => onScrubEnd(v)}
        onPointerDown={onScrubStart}
        min={0}
        max={max}
        step={1}
        aria-label="Seek"
        className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-primary"
      />
    </div>
  )
}

function SubtitleMenu({
  countries,
  selectedId,
  selectedLabel,
  onSelect,
}: {
  countries: Array<SubtitleCountry>
  selectedId: string | null
  selectedLabel: string
  onSelect: (id: string | null) => void
}) {
  const [country, setCountry] = React.useState<SubtitleCountry | null>(() =>
    selectedId
      ? countries.find((c) => c.tracks.some((t) => t.id === selectedId)) ?? null
      : null,
  )
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setCountry(
        selectedId
          ? countries.find((c) => c.tracks.some((t) => t.id === selectedId)) ??
              null
          : null,
      )
    }
  }, [open, selectedId, countries])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Subtitles"
          className="inline-flex size-9 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 data-[state=open]:bg-white/15"
        >
          {selectedId ? (
            <Captions className="size-5" />
          ) : (
            <CaptionsOff className="size-5" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-72 max-w-[90vw] gap-0 p-0"
      >
        <MenuHeader
          title={country ? country.name : 'Subtitles'}
          subtitle={country ? 'Pick a track' : selectedLabel}
          onBack={country ? () => setCountry(null) : undefined}
        />
        <div className="max-h-72 overflow-y-auto p-1">
          {country ? (
            <>
              <MenuRow
                onClick={() => {
                  onSelect(null)
                  setOpen(false)
                }}
                selected={selectedId === null}
                label="Off"
              />
              {country.tracks.map((track) => (
                <MenuRow
                  key={track.id}
                  onClick={() => {
                    onSelect(track.id)
                    setOpen(false)
                  }}
                  selected={selectedId === track.id}
                  label={track.label}
                  hint={!track.src ? 'No source' : undefined}
                />
              ))}
            </>
          ) : (
            <>
              <MenuRow
                onClick={() => {
                  onSelect(null)
                  setOpen(false)
                }}
                selected={selectedId === null}
                label="Off"
              />
              {countries.map((c) => {
                const activeIn = c.tracks.some((t) => t.id === selectedId)
                return (
                  <MenuRow
                    key={c.code}
                    onClick={() => setCountry(c)}
                    selected={activeIn}
                    label={c.name}
                    hint={`${c.tracks.length} ${c.tracks.length === 1 ? 'track' : 'tracks'}`}
                    chevron
                  />
                )
              })}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function AudioMenu({
  tracks,
  selectedId,
  onSelect,
}: {
  tracks: Array<AudioOption>
  selectedId: string | undefined
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Audio track"
          className="inline-flex size-9 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 data-[state=open]:bg-white/15"
        >
          <Languages className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-64 max-w-[90vw] gap-0 p-0"
      >
        <MenuHeader title="Audio" subtitle="Choose a language" />
        <div className="max-h-72 overflow-y-auto p-1">
          {tracks.map((track) => (
            <MenuRow
              key={track.id}
              onClick={() => {
                onSelect(track.id)
                setOpen(false)
              }}
              selected={selectedId === track.id}
              label={track.language}
              hint={track.label}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SettingsMenu({
  qualities,
  qualityIndex,
  onQualityChange,
  activeQualityLabel,
  activeAudioLabel,
  activeSubtitleLabel,
}: {
  qualities: Array<QualityOption>
  qualityIndex: number
  onQualityChange: (index: number) => void
  activeQualityLabel: string
  activeAudioLabel: string
  activeSubtitleLabel: string
}) {
  const [open, setOpen] = React.useState(false)
  const [section, setSection] = React.useState<'root' | 'quality'>('root')

  React.useEffect(() => {
    if (!open) setSection('root')
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Settings"
          className="inline-flex size-9 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 data-[state=open]:bg-white/15"
        >
          <Settings className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-64 max-w-[90vw] gap-0 p-0"
      >
        {section === 'root' ? (
          <>
            <MenuHeader title="Settings" />
            <div className="p-1">
              <MenuRow
                onClick={() => setSection('quality')}
                label="Quality"
                hint={activeQualityLabel}
                chevron
              />
              <MenuRow disabled label="Audio" hint={activeAudioLabel} />
              <MenuRow disabled label="Subtitles" hint={activeSubtitleLabel} />
            </div>
          </>
        ) : (
          <>
            <MenuHeader
              title="Quality"
              subtitle="Pick a resolution"
              onBack={() => setSection('root')}
            />
            <div className="max-h-72 overflow-y-auto p-1">
              {qualities.map((quality, index) => (
                <MenuRow
                  key={quality.label + index}
                  onClick={() => {
                    onQualityChange(index)
                    setOpen(false)
                  }}
                  selected={index === qualityIndex}
                  label={quality.label}
                />
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

function MenuHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground/80">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function MenuRow({
  label,
  hint,
  selected,
  disabled,
  chevron,
  onClick,
}: {
  label: string
  hint?: string
  selected?: boolean
  disabled?: boolean
  chevron?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
        disabled
          ? 'cursor-default text-muted-foreground'
          : 'text-foreground hover:bg-muted',
        selected && !disabled && 'bg-muted/70',
      )}
    >
      <span className="grid size-4 shrink-0 place-items-center text-primary">
        {selected ? <Check className="size-4" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <MarqueeText text={label} />
      </span>
      {hint && (
        <span className="ml-2 min-w-0 max-w-[60%] shrink">
          <MarqueeText
            text={hint}
            className="text-right text-xs text-muted-foreground"
          />
        </span>
      )}
      {chevron && <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />}
    </button>
  )
}

function MarqueeText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const containerRef = React.useRef<HTMLSpanElement>(null)
  const innerRef = React.useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = React.useState(false)
  const [duration, setDuration] = React.useState(14)

  React.useLayoutEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return
    const intrinsic = inner.scrollWidth
    const available = container.clientWidth
    const overflows = intrinsic > available + 1
    setOverflow(overflows)
    if (overflows) {
      setDuration(Math.max(8, Math.round(intrinsic / 28)))
    }
  }, [text])

  return (
    <span
      ref={containerRef}
      className={cn(
        'relative block w-full overflow-hidden whitespace-nowrap',
        className,
      )}
    >
      <span
        ref={innerRef}
        className={cn(
          'inline-block',
          overflow && 'animate-marquee will-change-transform',
        )}
        style={
          overflow
            ? ({ ['--marquee-duration' as string]: `${duration}s` } as React.CSSProperties)
            : undefined
        }
      >
        {text}
        {overflow && (
          <span aria-hidden className="ml-12">
            {text}
          </span>
        )}
      </span>
    </span>
  )
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}
