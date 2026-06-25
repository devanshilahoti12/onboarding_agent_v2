import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types'

interface AuthContextValue {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('igna_token'))
  const [user, setUser] = useState<User | null>(() => {
    const raw = sessionStorage.getItem('igna_user')
    return raw ? JSON.parse(raw) : null
  })

  function setAuth(newToken: string, newUser: User) {
    sessionStorage.setItem('igna_token', newToken)
    sessionStorage.setItem('igna_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function clearAuth() {
    sessionStorage.removeItem('igna_token')
    sessionStorage.removeItem('igna_user')
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ token, user, setAuth, clearAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
