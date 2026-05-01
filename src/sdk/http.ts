import { TypenxApiError } from './errors'

type RequestBody = BodyInit | Record<string, unknown> | undefined

export type HttpClientOptions = {
  baseUrl: string
  fetcher?: typeof fetch
}

export class HttpClient {
  readonly baseUrl: string
  private readonly fetcher: typeof fetch

  constructor({ baseUrl, fetcher }: HttpClientOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.fetcher = (fetcher ?? fetch).bind(globalThis)
  }

  get<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'GET' })
  }

  post<T>(path: string, body?: RequestBody, init?: RequestInit) {
    return this.request<T>(path, {
      ...init,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
      headers: {
        ...(body instanceof FormData
          ? {}
          : { 'content-type': 'application/json' }),
        ...init?.headers,
      },
    })
  }

  delete<T>(path: string, init?: RequestInit) {
    return this.request<T>(path, { ...init, method: 'DELETE' })
  }

  async request<T>(path: string, init: RequestInit = {}) {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        accept: 'application/json',
        ...init.headers,
      },
    })

    if (!response.ok) {
      const payload = await readPayload(response)
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
          ? payload.message
          : response.statusText
      throw new TypenxApiError(response.status, message, payload)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }
}

async function readPayload(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}
