import type { HttpClient } from '../http'
import type {
  AddonSearchResult,
  AddonRegistration,
  AnimeMetadata,
  CatalogRequest,
  CatalogResponse,
  SearchRequest,
  VideoSourceRequest,
  VideoSourceResponse,
} from '../types'

export class CatalogResource {
  constructor(private readonly http: HttpClient) {}

  catalogs(request: CatalogRequest) {
    return this.http.post<CatalogResponse>('/catalogs', request)
  }

  search(request: SearchRequest) {
    return this.http.post<CatalogResponse>('/search', request)
  }

  async searchAddons(
    request: Omit<SearchRequest, 'addon_id'>,
  ): Promise<AddonSearchResult[]> {
    const addons = await this.http.get<AddonRegistration[]>('/addons')
    const enabled = addons.filter((addon) => addon.enabled)
    const official = enabled.filter((addon) =>
      [
        'typenx-addon-season-centralizer',
        'typenx-addon-anilist',
        'typenx-addon-myanimelist',
        'typenx-addon-kitsu',
      ].includes(
        addon.manifest?.id ?? '',
      ),
    )
    const centralizer = official.find(
      (addon) => addon.manifest?.id === 'typenx-addon-season-centralizer',
    )
    const selected = centralizer
      ? [centralizer]
      : official.length > 0
        ? official
        : enabled
    const rows = await Promise.all(
      selected.map(async (addon) => {
        const response = await this.search({
          ...request,
          addon_id: addon.id,
        })
        return response.items.map((item) => ({
          addon,
          item,
        }))
      }),
    )

    return rows.flat()
  }

  anime(animeId: string, addonId?: string) {
    const query = addonId ? `?addon_id=${encodeURIComponent(addonId)}` : ''
    return this.http.get<AnimeMetadata>(
      `/anime/${encodeURIComponent(animeId)}${query}`,
    )
  }

  videos(request: VideoSourceRequest) {
    return this.http.post<VideoSourceResponse>('/videos', request)
  }

  mangaCatalogs(request: CatalogRequest) {
    return this.http.post<CatalogResponse>('/manga/catalogs', request)
  }

  mangaSearch(request: SearchRequest) {
    return this.http.post<CatalogResponse>('/manga/search', request)
  }

  manga(mangaId: string, addonId?: string) {
    const query = addonId ? `?addon_id=${encodeURIComponent(addonId)}` : ''
    return this.http.get<AnimeMetadata>(
      `/manga/${encodeURIComponent(mangaId)}${query}`,
    )
  }
}
