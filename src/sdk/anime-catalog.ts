import { isGuestMode } from '#/lib/guest'
import { typenx } from '#/sdk'
import type {
  AddonRegistration,
  AddonSearchResult,
  AnimeListEntry,
  AnimeMetadata,
  AnimePreview,
  AuthProvider,
  ProviderAccount,
} from '#/sdk'

export type CatalogRow = {
  addon: AddonRegistration
  shows: AnimePreview[]
  error: string | null
}

export type WatchingShow = {
  addon: AddonRegistration
  entry: AnimeListEntry
  show: AnimePreview
}

export type FeaturedShowDetails = {
  addon: AddonRegistration
  show: AnimePreview
  metadata: AnimeMetadata | null
}

export type AnimeCatalogData = {
  rows: CatalogRow[]
  watching: WatchingShow[]
  featured: FeaturedShowDetails | null
}

const OFFICIAL_ADDON_IDS = [
  'typenx-addon-season-centralizer',
  'typenx-addon-anilist',
  'typenx-addon-myanimelist',
  'typenx-addon-kitsu',
]

const SEASON_CENTRALIZER_ADDON_ID = 'typenx-addon-season-centralizer'

export async function loadAnimeCatalog(): Promise<AnimeCatalogData> {
  const guest = isGuestMode()
  const [addons, providers, library] = await Promise.all([
    typenx.addons.list(),
    guest ? Promise.resolve<ProviderAccount[]>([]) : typenx.me.providers(),
    guest ? Promise.resolve<AnimeListEntry[]>([]) : typenx.me.library(),
  ])
  const selectedAddons = selectCatalogAddons(addons, providers)
  const [rows, watching] = await Promise.all([
    Promise.all(
      selectedAddons.map(async (addon) => {
        try {
          const response = await typenx.catalog.catalogs({
            addon_id: addon.id,
            catalog_id: preferredCatalogId(addon),
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
    ),
    loadCurrentlyWatching(library, selectedAddons),
  ])
  const featured = await loadFeaturedDetails(rows, watching)
  return { rows, watching, featured }
}

async function loadFeaturedDetails(
  rows: CatalogRow[],
  watching: WatchingShow[],
): Promise<FeaturedShowDetails | null> {
  const pick = pickFeatured(rows, watching)
  if (!pick) return null

  try {
    const metadata = await typenx.catalog.anime(pick.show.id, pick.addon.id)
    return { ...pick, metadata }
  } catch {
    return { ...pick, metadata: null }
  }
}

function pickFeatured(
  rows: CatalogRow[],
  watching: WatchingShow[],
): { addon: AddonRegistration; show: AnimePreview } | null {
  if (watching.length > 0) {
    const firstWatching = watching[0]
    return { addon: firstWatching.addon, show: firstWatching.show }
  }
  for (const row of rows) {
    if (row.shows.length > 0) {
      return { addon: row.addon, show: row.shows[0] }
    }
  }
  return null
}

export async function searchAnimeCatalog(
  query: string,
  limit = 18,
): Promise<AddonSearchResult[]> {
  return typenx.catalog.searchAddons({ query, limit })
}

async function loadCurrentlyWatching(
  library: AnimeListEntry[],
  addons: AddonRegistration[],
): Promise<WatchingShow[]> {
  const watchingEntries = library
    .filter((entry) => entry.status === 'watching')
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 12)

  const loaded = await Promise.all(
    watchingEntries.map(async (entry) => {
      const addon = addonForProvider(addons, entry.provider)
      if (!addon) return null

      try {
        const response = await typenx.catalog.search({
          addon_id: addon.id,
          query: entry.title,
          limit: 5,
        })
        const show =
          response.items.find((item) => item.id === entry.provider_anime_id) ??
          response.items.find(
            (item) => item.title.toLowerCase() === entry.title.toLowerCase(),
          ) ??
          response.items.at(0)

        if (!show) return null
        return { addon, entry, show }
      } catch {
        return {
          addon,
          entry,
          show: {
            id: entry.provider_anime_id,
            title: entry.title,
            poster: null,
            year: null,
            content_type: 'anime' as const,
          },
        }
      }
    }),
  )

  return loaded.filter((item): item is WatchingShow => !!item)
}

export function selectCatalogAddons(
  addons: AddonRegistration[],
  providers: ProviderAccount[],
) {
  const enabled = addons.filter((addon) => addon.enabled)
  const official = enabled.filter((addon) =>
    OFFICIAL_ADDON_IDS.includes(addon.manifest?.id ?? ''),
  )
  const providerOrder: string[] = providers.map((provider) =>
    provider.provider === 'anilist'
      ? 'typenx-addon-anilist'
      : 'typenx-addon-myanimelist',
  )

  const linkedOfficial = providerOrder
    .map((manifestId) =>
      official.find((addon) => addon.manifest?.id === manifestId),
    )
    .filter((addon): addon is AddonRegistration => !!addon)
  const unlinkedOfficial = official.filter(
    (addon) => !providerOrder.includes(addon.manifest?.id ?? ''),
  )
  const centralizer = official.find(
    (addon) => addon.manifest?.id === SEASON_CENTRALIZER_ADDON_ID,
  )
  const selected = centralizer
    ? [centralizer]
    : uniqueAddons([...linkedOfficial, ...unlinkedOfficial])

  if (selected.length > 0) return uniqueAddons(selected)
  return enabled
}

function uniqueAddons(addons: AddonRegistration[]) {
  const seen = new Set<string>()
  return addons.filter((addon) => {
    if (seen.has(addon.id)) return false
    seen.add(addon.id)
    return true
  })
}

export function preferredCatalogId(addon: AddonRegistration) {
  const catalogs = addon.manifest?.catalogs ?? []
  if (catalogs.some((catalog) => catalog.id === 'popular')) return 'popular'
  return catalogs[0]?.id ?? 'popular'
}

export function addonForProvider(
  addons: AddonRegistration[],
  provider: AuthProvider,
) {
  const manifestId =
    provider === 'anilist'
      ? 'typenx-addon-anilist'
      : 'typenx-addon-myanimelist'

  return addons.find((addon) => addon.manifest?.id === manifestId)
}

export function addonName(addon: AddonRegistration) {
  try {
    return addon.manifest?.name ?? new URL(addon.base_url).hostname
  } catch {
    return addon.manifest?.name ?? addon.base_url
  }
}

export function watchingLabel(entry: AnimeListEntry, addon: AddonRegistration) {
  const progress =
    entry.total_episodes && entry.total_episodes > 0
      ? `${entry.progress_episodes}/${entry.total_episodes} eps`
      : `${entry.progress_episodes} eps`

  return `${progress} - ${addonName(addon)}`
}
