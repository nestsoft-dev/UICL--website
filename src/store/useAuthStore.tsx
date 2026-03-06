import { createContext, useContext, useMemo, useState, type FC, type ReactNode } from 'react'
import { authStorage, type AuthUser } from '../lib/auth'

type AuthState = {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser, remember?: boolean) => void
  logout: () => void
  setUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export const AuthProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    authStorage.getToken(),
  )
  const [user, setUserState] = useState<AuthUser | null>(
    authStorage.getUser(),
  )

  const login = (newToken: string, newUser: AuthUser, remember = true) => {
    setToken(newToken)
    setUserState(newUser)
    if (remember) {
      authStorage.setToken(newToken)
      authStorage.setUser(newUser)
    } else {
      authStorage.setMemoryToken(newToken)
    }
  }

  const logout = () => {
    setToken(null)
    setUserState(null)
    authStorage.clearAll()
  }

  const setUser = (newUser: AuthUser) => {
    setUserState(newUser)
    authStorage.setUser(newUser)
  }

  const value = useMemo(
    () => ({ user, token, login, logout, setUser }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthStore = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthStore must be used within AuthProvider error')
  }
  return ctx
}
