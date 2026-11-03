import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth'
import type { User } from '../types'

const TOKEN_KEY = 'token'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  )
  const [isLoading, setIsLoading] = useState<boolean>(!!token)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    authApi
      .me()
      .then((fetched) => {
        if (!cancelled) setUser(fetched)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const persistSession = (nextUser: User, nextToken: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }

  const login = async (payload: LoginPayload) => {
    const { user: u, token: t } = await authApi.login(payload)
    persistSession(u, t)
  }

  const register = async (payload: RegisterPayload) => {
    const { user: u, token: t } = await authApi.register(payload)
    persistSession(u, t)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors; always clear local state
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
