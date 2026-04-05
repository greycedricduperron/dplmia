import React, { createContext, useContext, useEffect, useState } from 'react'
import { meFn } from '../functions/user'
import { authClient } from '../lib/auth-client'
import i18n from '../i18n'

export interface AuthUser {
  id: string
  name: string
  email: string
  language: string | null
  country: string | null
  onboardingComplete: boolean
  class: {
    id: string
    name: string
    country: string
    language: string
    userId: string
    createdAt: string | Date
  } | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  setUser: (u: AuthUser | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    meFn()
      .then((u) => {
        const me = u as AuthUser | null
        setUserState(me)
        if (me?.language) i18n.changeLanguage(me.language)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function setUser(u: AuthUser | null) {
    setUserState(u)
    if (u?.language) i18n.changeLanguage(u.language)
  }

  async function logout() {
    await authClient.signOut()
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
