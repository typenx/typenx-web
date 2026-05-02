import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import type { User } from '#/sdk'

export type RouterContext = {
  user: User | null
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: { user: null } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 30_000,
    defaultPendingMs: 100,
    defaultPendingMinMs: 200,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
