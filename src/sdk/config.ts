export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080'

export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_TYPENX_API_BASE_URL?.replace(/\/+$/, '') ??
    DEFAULT_API_BASE_URL
  )
}
