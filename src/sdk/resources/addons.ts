import type { HttpClient } from '../http'
import type {
  AddonManifest,
  AddonRegistration,
  RegisterAddonRequest,
} from '../types'

export class AddonsResource {
  constructor(private readonly http: HttpClient) {}

  list() {
    return this.http.get<AddonRegistration[]>('/addons')
  }

  register(request: RegisterAddonRequest) {
    return this.http.post<AddonRegistration>('/addons', request)
  }

  manifest(addonId: string) {
    return this.http.get<AddonManifest>(`/addons/${addonId}/manifest`)
  }
}
