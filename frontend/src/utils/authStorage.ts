import type { AuthTokens, UserProfile } from '../types'

const TOKENS_KEY = 'crm_auth_tokens'
const USER_KEY = 'crm_auth_user'

export function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function loadTokens(): AuthTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_KEY)
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function loadUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY)
}
