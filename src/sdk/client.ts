import { getApiBaseUrl } from './config'
import { HttpClient  } from './http'
import type {HttpClientOptions} from './http';
import { AddonsResource } from './resources/addons'
import { AuthResource } from './resources/auth'
import { CatalogResource } from './resources/catalog'
import { MeResource } from './resources/me'

export type TypenxClientOptions = Partial<HttpClientOptions>

export class TypenxClient {
  readonly http: HttpClient
  readonly auth: AuthResource
  readonly me: MeResource
  readonly addons: AddonsResource
  readonly catalog: CatalogResource

  constructor(options: TypenxClientOptions = {}) {
    this.http = new HttpClient({
      baseUrl: options.baseUrl ?? getApiBaseUrl(),
      fetcher: options.fetcher,
    })
    this.auth = new AuthResource(this.http)
    this.me = new MeResource(this.http)
    this.addons = new AddonsResource(this.http)
    this.catalog = new CatalogResource(this.http)
  }
}
