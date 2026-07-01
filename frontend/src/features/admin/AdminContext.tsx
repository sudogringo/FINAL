import { createContext, useContext, useState, type ReactNode } from 'react'

interface AdminContextValue {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AdminContext = createContext<AdminContextValue | null>(null)

const STORAGE_KEY = 'gh_admin_token'

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  function login(newToken: string) {
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }

  return (
    <AdminContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin debe usarse dentro de AdminProvider')
  return ctx
}
