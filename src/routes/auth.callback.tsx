import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { useAuth } from '#/components/auth-provider'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const { refresh } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    void refresh()
      .then(() => navigate({ to: '/anime', replace: true }))
      .catch(() => navigate({ to: '/', replace: true }))
  }, [navigate, refresh])

  return (
    <div className="grid min-h-svh place-items-center bg-background px-6">
      <p className="text-sm text-muted-foreground">Finishing sign in...</p>
    </div>
  )
}
