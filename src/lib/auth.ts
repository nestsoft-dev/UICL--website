export type ClearanceRole =
  | 'HR_ADMIN'
  | 'SITE_SUPERVISOR'
  | 'DATA_ENTRY'
  | 'VIEWER'

export type AuthUser = {
  id?: string
  fullName: string
  email: string
  role: ClearanceRole
  siteId?: string | null
}

const TOKEN_KEY = 'bio_access_token'
const USER_KEY = 'bio_user'
let memoryToken: string | null = null

export const authStorage = {
  getToken(): string | null {
    return memoryToken ?? localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string) {
    memoryToken = token
    localStorage.setItem(TOKEN_KEY, token)
  },
  setMemoryToken(token: string) {
    memoryToken = token
  },
  clearToken() {
    memoryToken = null
    localStorage.removeItem(TOKEN_KEY)
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },
  setUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clearUser() {
    localStorage.removeItem(USER_KEY)
  },
  clearAll() {
    memoryToken = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
