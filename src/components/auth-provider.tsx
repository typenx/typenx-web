import * as React from 'react'

import { typenx } from '#/sdk'
import type { AuthProvider } from '#/sdk'

type AuthContextValue = {
  signIn: (provider: AuthProvider) => Promise<void>
  signUp: (provider: AuthProvider) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo<AuthContextValue>(
    () => ({
      signIn: (provider) => typenx.auth.redirectToLogin(provider),
      signUp: (provider) => typenx.auth.redirectToSignup(provider),
      signOut: () => typenx.auth.logout(),
    }),
    [],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
