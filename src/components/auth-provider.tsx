import * as React from 'react'

type User = { username: string }

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isReady: boolean
  signIn: (username: string) => void
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'typenx-user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {
      // ignore
    }
    setIsReady(true)
  }, [])

  const signIn = React.useCallback((username: string) => {
    const next: User = { username: username.trim() || 'guest' }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
  }, [])

  const signOut = React.useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isReady, signIn, signOut }),
    [user, isReady, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
