import { typenx } from '#/sdk'
import type {
  AddonRegistration,
  AddonSearchResult,
  AnimePreview,
  CatalogResponse,
} from '#/sdk'

export type MangaCatalogRow = {
  addon: AddonRegistration
  shows: AnimePreview[]
  error: string | null
}

export type MangaCatalogData = {
  rows: MangaCatalogRow[]
}

const MANGA_CACHE_TTL_MS = 10 * 60_000

type SearchCacheEntry = {
  expiresAt: number
  promise: Promise<AddonSearchResult[]>
  value?: AddonSearchResult[]
}

const searchCache = new Map<string, SearchCacheEntry>()

export async function loadMangaCatalog(): Promise<MangaCatalogData> {
  const addons = await typenx.addons.list()
  const selectedAddons = selectMangaAddons(addons)
  const rows = await Promise.all(
    selectedAddons.map(async (addon) => {
      try {
        const response = await typenx.catalog.mangaCatalogs({
          addon_id: addon.id,
          catalog_id: preferredMangaCatalogId(addon),
          content_type: 'manga',
          limit: 24,
        })
        return { addon, shows: response.items, error: null }
      } catch (err) {
        return {
          addon,
          shows: [],
          error:
            err instanceof Error
              ? err.message
              : `Unable to load ${addonName(addon)}`,
        }
      }
    }),
  )

  return { rows }
}

export async function searchMangaCatalog(
  query: string,
  limit = 18,
): Promise<AddonSearchResult[]> {
  const cacheKey = searchCacheKey(query, limit)
  const now = Date.now()
  const cached = searchCache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.value ?? cached.promise
  }

  const promise = runMangaSearch(query, limit).then((value) => {
    const entry = searchCache.get(cacheKey)
    if (entry) entry.value = value
    return value
  })

  searchCache.set(cacheKey, {
    expiresAt: now + MANGA_CACHE_TTL_MS,
    promise,
  })

  try {
    return await promise
  } catch (error) {
    searchCache.delete(cacheKey)
    throw error
  }
}

export function getCachedMangaCatalogSearch(query: string, limit = 18) {
  const cached = searchCache.get(searchCacheKey(query, limit))
  if (!cached || cached.expiresAt <= Date.now()) return null
  return cached.value ?? null
}

async function runMangaSearch(query: string, limit: number) {
  const addons = await typenx.addons.list()
  const selectedAddons = selectMangaAddons(addons)
  const rows = await Promise.all(
    selectedAddons.map(async (addon) => {
      const response: CatalogResponse = await typenx.catalog.mangaSearch({
        addon_id: addon.id,
        query,
        limit,
        content_type: 'manga',
      })
      return response.items.map((item) => ({ addon, item }))
    }),
  )
  return rows.flat()
}

export function selectMangaAddons(addons: AddonRegistration[]) {
  return addons.filter((addon) =>
    addon.enabled &&
    addon.manifest?.catalogs.some(
      (catalog) =>
        catalog.content_type === 'manga' ||
        catalog.content_type === 'manhwa' ||
        catalog.content_type === 'manhua' ||
        catalog.content_type === 'light_novel',
    ),
  )
}

export function preferredMangaCatalogId(addon: AddonRegistration) {
  const catalogs = addon.manifest?.catalogs ?? []
  return (
    catalogs.find((catalog) => catalog.content_type === 'manga')?.id ??
    catalogs.find((catalog) =>
      ['manhwa', 'manhua', 'light_novel'].includes(catalog.content_type),
    )?.id ??
    'popular'
  )
}

export function addonName(addon: AddonRegistration) {
  try {
    return addon.manifest?.name ?? new URL(addon.base_url).hostname
  } catch {
    return addon.manifest?.name ?? addon.base_url
  }
}

function searchCacheKey(query: string, limit: number) {
  return `${query.trim().toLowerCase()}:${limit}`
}
