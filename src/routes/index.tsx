import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

import { ModeToggle } from '#/components/mode-toggle'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

export const Route = createFileRoute('/')({ component: LoginPage })

function LoginPage() {
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')

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
                ? 'Sign in to continue to your workspace.'
                : 'A username and password is all you need.'}
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
            <AuthForm mode="signin" />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <AuthForm mode="signup" />
          </TabsContent>
        </Tabs>

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

function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-username`}>Username</Label>
        <Input
          id={`${mode}-username`}
          name="username"
          type="text"
          autoComplete={mode === 'signin' ? 'username' : 'username'}
          placeholder="yourname"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${mode}-password`}>Password</Label>
          {mode === 'signin' && (
            <a
              href="#"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot?
            </a>
          )}
        </div>
        <div className="relative">
          <Input
            id={`${mode}-password`}
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={
              mode === 'signin' ? 'current-password' : 'new-password'
            }
            placeholder="••••••••"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
        <ArrowRight />
      </Button>
    </form>
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
