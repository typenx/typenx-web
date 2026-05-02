const GUEST_KEY = 'typenx-guest'
const GUEST_PROGRESS_KEY = 'typenx-guest-progress'

export function isGuestMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(GUEST_KEY) === '1'
}

export function setGuestMode(value: boolean) {
  if (typeof window === 'undefined') return
  if (value) {
    window.localStorage.setItem(GUEST_KEY, '1')
  } else {
    window.localStorage.removeItem(GUEST_KEY)
  }
}

export type GuestWatchProgress = {
  anime_id: string
  episode_id: string | null
  episode_number: number | null
  position_seconds: number
  duration_seconds: number | null
  completed: boolean
  updated_at: string
}

export function getGuestProgress(animeId: string, episodeId: string | null) {
  return getGuestProgressRows().find(
    (row) => row.anime_id === animeId && row.episode_id === episodeId,
  )
}

export function saveGuestProgress(progress: Omit<GuestWatchProgress, 'updated_at'>) {
  if (typeof window === 'undefined') return
  const rows = getGuestProgressRows()
  const next = {
    ...progress,
    updated_at: new Date().toISOString(),
  }
  const index = rows.findIndex(
    (row) =>
      row.anime_id === progress.anime_id &&
      row.episode_id === progress.episode_id,
  )
  if (index >= 0) {
    rows[index] = next
  } else {
    rows.push(next)
  }
  window.localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(rows.slice(-500)))
}

function getGuestProgressRows(): GuestWatchProgress[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(GUEST_PROGRESS_KEY) ?? '[]',
    ) as GuestWatchProgress[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
