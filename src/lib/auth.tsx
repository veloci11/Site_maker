import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api'

export type User = { id: string; name: string; email: string; role: 'customer' | 'admin' }
type AuthValue = { user: User | null; loading: boolean; refresh: () => Promise<User | null>; login: (email: string, password: string) => Promise<User>; register: (name: string, email: string, password: string) => Promise<User>; logout: () => Promise<void> }
const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => {
    const data = await api<{ user: User | null }>('/api/auth/me')
    setUser(data.user); setLoading(false); return data.user
  }, [])
  useEffect(() => { let active = true; api<{ user: User | null }>('/api/auth/me').then(data => { if (active) setUser(data.user) }).catch(() => { if (active) setUser(null) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  const login = useCallback(async (email: string, password: string) => { const { user } = await api<{ user: User }>('/api/auth/login', { method: 'POST', body: { email, password } }); setUser(user); return user }, [])
  const register = useCallback(async (name: string, email: string, password: string) => { const { user } = await api<{ user: User }>('/api/auth/register', { method: 'POST', body: { name, email, password } }); setUser(user); return user }, [])
  const logout = useCallback(async () => { await api('/api/auth/logout', { method: 'POST' }); setUser(null) }, [])
  const value = useMemo(() => ({ user, loading, refresh, login, register, logout }), [user, loading, refresh, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider manquant'); return context }
