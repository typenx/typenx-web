import type { HttpClient } from '../http'
import type { AuthProvider, OAuthLoginResponse } from '../types'

export class AuthResource {
  constructor(private readonly http: HttpClient) {}

  login(provider: AuthProvider) {
    return this.http.get<OAuthLoginResponse>(
      `/auth/${providerPath(provider)}/login`,
    )
  }

  signup(provider: AuthProvider) {
    return this.login(provider)
  }

  async redirectToLogin(provider: AuthProvider) {
    const response = await this.login(provider)
    window.location.assign(response.authorization_url)
  }

  async redirectToSignup(provider: AuthProvider) {
    await this.redirectToLogin(provider)
  }

  logout() {
    return this.http.post<void>('/auth/logout')
  }
}

function providerPath(provider: AuthProvider) {
  return provider === 'my_anime_list' ? 'mal' : 'anilist'
}
