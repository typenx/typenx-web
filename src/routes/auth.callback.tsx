import { createFileRoute, redirect } from '@tanstack/react-router'

import { isTypenxApiError, typenx } from '#/sdk'

export const Route = createFileRoute('/auth/callback')({
  ssr: false,
  loader: async () => {
    try {
      await loadProfile()
    } catch (err) {
      if (isTypenxApiError(err) && err.status === 401) {
        throw redirect({
          to: '/',
          search: { auth_error: 'session_not_found' },
          replace: true,
        })
      }
      throw redirect({
        to: '/',
        search: { auth_error: 'callback_failed' },
        replace: true,
      })
    }
    throw redirect({ to: '/anime', replace: true })
  },
  component: AuthCallbackPage,
})

async function loadProfile() {
  try {
    return await typenx.me.profile()
  } catch (err) {
    if (isTypenxApiError(err) && err.status === 404) {
      const current = await typenx.me.current()
      return current.user
    }
    throw err
  }
}

function AuthCallbackPage() {
  return (
    <div className="grid min-h-svh place-items-center bg-background px-6">
      <p className="text-sm text-muted-foreground">Finishing sign in...</p>
    </div>
  )
}
