export { TypenxClient } from './client'
export { DEFAULT_API_BASE_URL, getApiBaseUrl } from './config'
export { TypenxApiError, isTypenxApiError } from './errors'
export type * from './types'

import { TypenxClient } from './client'

export const typenx = new TypenxClient()
