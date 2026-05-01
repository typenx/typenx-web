import type { HttpClient } from '../http'
import type {
  AnimeListEntry,
  CurrentUser,
  ProviderAccount,
  User,
  WatchProgress,
} from '../types'

export class MeResource {
  constructor(private readonly http: HttpClient) {}

  current() {
    return this.http.get<CurrentUser>('/me')
  }

  profile() {
    return this.http.get<User>('/profile')
  }

  providers() {
    return this.http.get<ProviderAccount[]>('/me/providers')
  }

  library() {
    return this.http.get<AnimeListEntry[]>('/me/library')
  }

  progress() {
    return this.http.get<WatchProgress[]>('/me/progress')
  }
}
