import * as React from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { useAuth } from '#/components/auth-provider'
import { ModeToggle } from '#/components/mode-toggle'
import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { typenx  } from '#/sdk'
import type {AuthProvider} from '#/sdk';

export const Route = createFileRoute('/')({
  validateSearch: (search): { auth_error?: string; redirect?: string } => ({
    auth_error:
      typeof search.auth_error === 'string' ? search.auth_error : undefined,
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async () => {
    try {
      await typenx.me.current()
    } catch {
      return
    }
    throw redirect({ to: '/anime', replace: true })
  },
  component: LoginPage,
})

function LoginPage() {
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')
  const { error, isAuthenticated, isReady, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const search = Route.useSearch()

  React.useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate({ to: '/anime', replace: true })
    }
  }, [isReady, isAuthenticated, navigate])

  const handleProviderAuth = (provider: AuthProvider) => {
    if (mode === 'signin') {
      void signIn(provider)
      return
    }
    void signUp(provider)
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

        {!isReady && (
          <p className="text-sm text-muted-foreground">Checking session...</p>
        )}

        {isReady && (
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
        )}

        {(error || search.auth_error) && (
          <p className="mt-4 text-center text-sm text-destructive">
            {error ??
              'Sign in finished, but the browser did not send back a Typenx session. Please retry from http://127.0.0.1:3000.'}
          </p>
        )}

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
