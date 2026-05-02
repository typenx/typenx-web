import { redirect } from '@tanstack/react-router'

import { isTypenxApiError } from '#/sdk'

export async function withAuthRedirect<T>(
  fn: () => Promise<T>,
  redirectHref: string,
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (isTypenxApiError(err) && err.status === 401) {
      throw redirect({
        to: '/',
        search: { redirect: redirectHref },
        replace: true,
      })
    }
    throw err
  }
}
