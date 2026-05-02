import * as React from 'react'
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { AlertTriangle, ArrowRight, RefreshCw, UserRound, WifiOff } from 'lucide-react'

import { useAuth } from '#/components/auth-provider'
import { Modal } from '#/components/custom/modal'
import { friendlyAuthError } from '#/lib/auth-errors'
import { setGuestMode } from '#/lib/guest'
import { ModeToggle } from '#/components/mode-toggle'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { getApiBaseUrl, isTypenxApiError, typenx } from '#/sdk'
import type { AuthProvider } from '#/sdk'

type GateStatus =
  | { status: 'ok' }
  | { status: 'no_providers' }
  | { status: 'unreachable'; message: string }

export const Route = createFileRoute('/')({
  ssr: false,
  validateSearch: (search): { auth_error?: string; redirect?: string } => ({
    auth_error:
      typeof search.auth_error === 'string' ? search.auth_error : undefined,
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  loader: async ({ location }): Promise<GateStatus> => {
    if (typeof window === 'undefined') return { status: 'ok' }

    let anySet: boolean
    try {
      anySet = await typenx.providers.anySet()
    } catch (err) {
      const message = isTypenxApiError(err)
        ? `Backend responded with ${err.status}: ${err.message}`
        : err instanceof Error
          ? err.message
          : 'Backend is not responding'
      return { status: 'unreachable', message }
    }

    if (!anySet) return { status: 'no_providers' }

    try {
      await typenx.me.current()
    } catch {
      return { status: 'ok' }
    }
    const search = location.search as { redirect?: string }
    throw redirect({ href: search.redirect ?? '/anime', replace: true })
  },
  component: LoginPage,
})

function LoginPage() {
  const gate = Route.useLoaderData()

  if (gate.status === 'unreachable') {
    return <BackendUnreachable message={gate.message} />
  }
  if (gate.status === 'no_providers') {
    return <BackendUnconfigured />
  }
  return <LoginForm />
}

function LoginForm() {
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')
  const [guestModalOpen, setGuestModalOpen] = React.useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const search = Route.useSearch()
  const authErrorMessage = friendlyAuthError(search.auth_error)

  const handleProviderAuth = (provider: AuthProvider) => {
    if (mode === 'signin') {
      void signIn(provider)
      return
    }
    void signUp(provider)
  }

  const handleConfirmGuest = () => {
    setGuestMode(true)
    void navigate({ to: '/anime', replace: true })
  }

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />

      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5">
        <Brand compact />
        <ModeToggle />
      </header>

      <main className="relative mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center px-6">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Brand />
          <div className="space-y-1">
            <h1 className="text-xl font-medium tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'Sign in with your anime list account.'
                : 'Create a Typenx account from a linked provider.'}
            </p>
          </div>
        </div>

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as 'signin' | 'signup')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <AuthOptions mode="signin" onSelect={handleProviderAuth} />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <AuthOptions mode="signup" onSelect={handleProviderAuth} />
          </TabsContent>
        </Tabs>

        {authErrorMessage && (
          <p className="mt-4 text-center text-sm text-destructive">
            {authErrorMessage}
          </p>
        )}

        <div className="mt-6 flex w-full items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            or
          </span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-4 w-full"
          onClick={() => setGuestModalOpen(true)}
        >
          <UserRound />
          Continue as a guest
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Watch progress is saved to this device only.
        </p>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          By continuing you agree to our{' '}
          <a className="underline-offset-4 hover:underline" href="#">
            Terms
          </a>{' '}
          and{' '}
          <a className="underline-offset-4 hover:underline" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </main>

      <Modal
        open={guestModalOpen}
        onOpenChange={setGuestModalOpen}
        variant="warning"
        title="Continue without an account?"
        description="Without AniList or MyAnimeList linked, we can't sync your watch progress to either service. Everything stays on this device."
        confirmLabel="Continue as guest"
        cancelLabel="Go back"
        onConfirm={handleConfirmGuest}
      />
    </div>
  )
}

function AuthOptions({
  mode,
  onSelect,
}: {
  mode: 'signin' | 'signup'
  onSelect: (provider: AuthProvider) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="lg"
        className="w-full bg-[#02A9FF] text-white hover:bg-[#02A9FF]/90 dark:bg-[#02A9FF] dark:hover:bg-[#02A9FF]/90"
        onClick={() => onSelect('anilist')}
      >
        {mode === 'signin' ? 'Sign in' : 'Create account'} with AniList
        <ArrowRight />
      </Button>
      <Button
        type="button"
        size="lg"
        className="w-full bg-[#2E51A2] text-white hover:bg-[#2E51A2]/90 dark:bg-[#2E51A2] dark:hover:bg-[#2E51A2]/90"
        onClick={() => onSelect('my_anime_list')}
      >
        {mode === 'signin' ? 'Sign in' : 'Create account'} with MyAnimeList
      </Button>
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Mark className="size-5" />
        <span className="text-sm font-medium tracking-tight">typenx</span>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <Mark className="size-9" />
    </div>
  )
}

function Mark({ className }: { className?: string }) {
  return (
    <div
      className={
        'relative grid place-items-center rounded-md bg-foreground text-background ' +
        (className ?? '')
      }
    >
      <span className="text-[0.7em] font-semibold leading-none">n</span>
      <span className="absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full bg-primary" />
    </div>
  )
}

function BackendUnreachable({ message }: { message: string }) {
  const router = useRouter()
  const [retrying, setRetrying] = React.useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await router.invalidate()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <GateShell>
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
        <WifiOff className="size-6 text-destructive" />
      </span>
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-medium tracking-tight">
          Can't reach the backend
        </h1>
        <p className="text-sm text-muted-foreground">
          We couldn't connect to the typenx backend. Make sure the server is
          running and reachable, then try again.
        </p>
      </div>
      <div className="w-full rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-left text-xs text-muted-foreground">
        <p className="font-medium text-destructive">{message}</p>
        <p className="mt-1">
          API base URL:{' '}
          <code className="font-mono text-foreground">{getApiBaseUrl()}</code>
        </p>
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={() => void handleRetry()}
        disabled={retrying}
      >
        <RefreshCw className={retrying ? 'animate-spin' : undefined} />
        {retrying ? 'Retrying...' : 'Try again'}
      </Button>
    </GateShell>
  )
}

function BackendUnconfigured() {
  const router = useRouter()
  const [retrying, setRetrying] = React.useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await router.invalidate()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <GateShell>
      <span className="grid size-12 place-items-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
        <AlertTriangle className="size-6 text-amber-500" />
      </span>
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-medium tracking-tight">
          Backend isn't configured
        </h1>
        <p className="text-sm text-muted-foreground">
          No OAuth providers are set up on the backend yet. Add credentials for
          AniList or MyAnimeList to your backend{' '}
          <code className="font-mono text-foreground">.env</code> file and
          restart the server.
        </p>
      </div>
      <div className="w-full rounded-md border bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Required env variables</p>
        <ul className="mt-1 space-y-0.5 font-mono">
          <li>ANILIST_CLIENT_ID / ANILIST_CLIENT_SECRET</li>
          <li>MAL_CLIENT_ID / MAL_CLIENT_SECRET</li>
        </ul>
        <p className="mt-2">
          At least one provider must be set for typenx to start.
        </p>
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={() => void handleRetry()}
        disabled={retrying}
      >
        <RefreshCw className={retrying ? 'animate-spin' : undefined} />
        {retrying ? 'Checking...' : "I've configured it"}
      </Button>
    </GateShell>
  )
}

function GateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5">
        <Brand compact />
        <ModeToggle />
      </header>
      <main className="relative mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-5 px-6">
        {children}
      </main>
    </div>
  )
}
