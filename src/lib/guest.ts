const GUEST_KEY = 'typenx-guest'

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
