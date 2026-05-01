import { createFileRoute } from '@tanstack/react-router'

import { useAuth } from '#/components/auth-provider'

export const Route = createFileRoute('/_authed/anime')({ component: AnimePage })

function AnimePage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Dashboard
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.username ?? 'guest'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your anime library will live here.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
        <p className="text-sm font-medium">Nothing to show yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Once we wire up the backend, your anime list will appear here.
        </p>
      </div>
    </div>
  )
}
