export type AuthProvider = 'anilist' | 'my_anime_list'

export type User = {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type LinkedProvider = {
  id: string
  user_id: string
  provider: AuthProvider
  provider_user_id: string
  provider_username: string
  access_token?: string
  refresh_token?: string | null
  expires_at: string | null
  linked_at: string
}

export type ProviderAccount = {
  id: string
  provider: AuthProvider
  provider_user_id: string
  provider_username: string
  expires_at: string | null
  linked_at: string
}

export type CurrentUser = {
  user: User
  providers: LinkedProvider[]
}

export type OAuthLoginResponse = {
  provider: AuthProvider
  authorization_url: string
}

export type WatchStatus =
  | 'planning'
  | 'watching'
  | 'completed'
  | 'paused'
  | 'dropped'

export type AnimeListEntry = {
  id: string
  user_id: string
  provider: AuthProvider
  provider_anime_id: string
  title: string
  status: WatchStatus
  score: number | null
  progress_episodes: number
  total_episodes: number | null
  updated_at: string
}

export type WatchProgress = {
  id: string
  user_id: string
  anime_id: string
  episode_id: string | null
  episode_number: number | null
  position_seconds: number
  duration_seconds: number | null
  completed: boolean
  updated_at: string
}

export type AddonResource = 'catalog' | 'search' | 'anime_meta' | 'episode_meta'

export type ContentType = 'anime' | 'movie' | 'ova' | 'ona' | 'special'

export type AddonManifest = {
  id: string
  name: string
  version: string
  description: string | null
  icon: string | null
  resources: AddonResource[]
  catalogs: CatalogDefinition[]
}

export type CatalogDefinition = {
  id: string
  name: string
  content_type: ContentType
  filters: CatalogFilter[]
}

export type CatalogFilter = {
  id: string
  name: string
  values: string[]
}

export type AddonRegistration = {
  id: string
  base_url: string
  enabled: boolean
  source: 'built_in' | 'user'
  deletable: boolean
  manifest: AddonManifest | null
  created_at: string
  updated_at: string
}

export type RegisterAddonRequest = {
  base_url: string
}

export type CatalogRequest = {
  addon_id?: string
  catalog_id: string
  skip?: number
  limit?: number
  query?: string
}

export type SearchRequest = {
  addon_id?: string
  query: string
  limit?: number
}

export type CatalogResponse = {
  items: AnimePreview[]
}

export type AnimePreview = {
  id: string
  title: string
  poster: string | null
  year: number | null
  content_type: ContentType
}

export type AnimeMetadata = {
  id: string
  title: string
  original_title: string | null
  synopsis: string | null
  poster: string | null
  banner: string | null
  year: number | null
  status: string | null
  genres: string[]
  episodes: EpisodeMetadata[]
  updated_at: string | null
}

export type EpisodeMetadata = {
  id: string
  anime_id: string
  number: number
  title: string | null
  synopsis: string | null
  thumbnail: string | null
  aired_at: string | null
}
