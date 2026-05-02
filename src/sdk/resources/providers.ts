import type { HttpClient } from '../http'

export class ProvidersResource {
  constructor(private readonly http: HttpClient) {}

  anySet() {
    return this.http.get<boolean>('/providers/any')
  }
}
