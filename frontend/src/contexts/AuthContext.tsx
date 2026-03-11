/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { ApiError, getCurrentUser, login as loginApi, refreshToken } from '../api/client'
import type { AuthTokens, UserProfile, UserRole } from '../types'
import { clearTokens, clearUser, loadTokens, loadUser, saveTokens, saveUser } from '../utils/authStorage'

type AuthContextType = {
  user: UserProfile | null
  tokens: AuthTokens | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasAnyRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(() => loadTokens())
  const [user, setUser] = useState<UserProfile | null>(() => loadUser())
  const [loading, setLoading] = useState(false)

  const logout = useCallback(() => {
    setTokens(null)
    setUser(null)
    clearTokens()
    clearUser()
  }, [])

  const hydrateUser = useCallback(
    async (currentTokens: AuthTokens) => {
      try {
        const me = await getCurrentUser(currentTokens.access)
        setUser(me)
        saveUser(me)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          try {
            const refreshed = await refreshToken(currentTokens.refresh)
            const nextTokens = { ...currentTokens, access: refreshed.access }
            setTokens(nextTokens)
            saveTokens(nextTokens)
            const me = await getCurrentUser(nextTokens.access)
            setUser(me)
            saveUser(me)
            return
          } catch {
            logout()
            return
          }
        }
        logout()
      }
    },
    [logout],
  )

  useEffect(() => {
    if (!tokens) return
    void hydrateUser(tokens)
  }, [tokens, hydrateUser])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const nextTokens = await loginApi(email, password)
      setTokens(nextTokens)
      saveTokens(nextTokens)
      const me = await getCurrentUser(nextTokens.access)
      setUser(me)
      saveUser(me)
    } finally {
      setLoading(false)
    }
  }, [])

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user],
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      tokens,
      loading,
      isAuthenticated: Boolean(tokens && user),
      login,
      logout,
      hasAnyRole,
    }),
    [user, tokens, loading, login, logout, hasAnyRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
