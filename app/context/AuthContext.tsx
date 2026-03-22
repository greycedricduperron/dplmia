import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Teacher } from '../types'
import { meFn, logoutFn } from '../functions/auth'
import i18n from '../i18n'

interface AuthContextValue {
  teacher: Teacher | null
  loading: boolean
  setTeacher: (t: Teacher | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [teacher, setTeacherState] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    meFn()
      .then((t) => {
        const me = t as Teacher
        setTeacherState(me)
        i18n.changeLanguage(me.language)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function setTeacher(t: Teacher | null) {
    setTeacherState(t)
    if (t) i18n.changeLanguage(t.language)
  }

  async function logout() {
    await logoutFn()
    setTeacherState(null)
  }

  return (
    <AuthContext.Provider value={{ teacher, loading, setTeacher, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
