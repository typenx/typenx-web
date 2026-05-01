import type { HttpClient } from '../http'
import type {
  AnimeMetadata,
  CatalogRequest,
  CatalogResponse,
  SearchRequest,
} from '../types'

export class CatalogResource {
  constructor(private readonly http: HttpClient) {}

  catalogs(request: CatalogRequest) {
    return this.http.post<CatalogResponse>('/catalogs', request)
  }

  search(request: SearchRequest) {
    return this.http.post<CatalogResponse>('/search', request)
  }

  anime(animeId: string, addonId?: string) {
    const query = addonId ? `?addon_id=${encodeURIComponent(addonId)}` : ''
    return this.http.get<AnimeMetadata>(
      `/anime/${encodeURIComponent(animeId)}${query}`,
    )
  }
}
