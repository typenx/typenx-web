export const DEFAULT_API_BASE_URL = '/api'

export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_TYPENX_API_BASE_URL?.replace(/\/+$/, '') ??
    DEFAULT_API_BASE_URL
  )
}
