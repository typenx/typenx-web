import * as React from 'react'

import { isTypenxApiError, typenx, type AuthProvider, type User } from '#/sdk'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isReady: boolean
  error: string | null
  refresh: () => Promise<User | null>
  signIn: (provider: AuthProvider) => Promise<void>
  signUp: (provider: AuthProvider) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isReady, setIsReady] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    try {
      const current = await typenx.me.current()
      setUser(current.user)
      setError(null)
      return current.user
    } catch (err) {
      if (isTypenxApiError(err) && err.status === 401) {
        setUser(null)
        setError(null)
        return null
      }
      setUser(null)
      setError(err instanceof Error ? err.message : 'Unable to load session')
      return null
    }
  }, [])

  React.useEffect(() => {
    void refresh().finally(() => setIsReady(true))
  }, [refresh])

  const signIn = React.useCallback(async (provider: AuthProvider) => {
    await typenx.auth.redirectToLogin(provider)
  }, [])

  const signUp = React.useCallback(async (provider: AuthProvider) => {
    await typenx.auth.redirectToSignup(provider)
  }, [])

  const signOut = React.useCallback(async () => {
    await typenx.auth.logout()
    setUser(null)
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isReady,
      error,
      refresh,
      signIn,
      signUp,
      signOut,
    }),
    [user, isReady, error, refresh, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
