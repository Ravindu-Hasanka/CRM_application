import type { ActivityLog, AuthTokens, Company, Contact, UserProfile } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function apiFetch<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const headers = new Headers(init?.headers ?? {})
  headers.set('Content-Type', 'application/json')
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const payload = await response.json()
      if (payload?.detail) detail = payload.detail
    } catch {
      // Ignore JSON parsing errors and keep fallback detail.
    }
    throw new ApiError(detail, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  return apiFetch<AuthTokens>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  return apiFetch<{ access: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  })
}

export async function getCurrentUser(accessToken: string): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/me', undefined, accessToken)
}

export async function getCompanies(accessToken: string): Promise<Company[]> {
  return apiFetch<Company[]>('/companies', undefined, accessToken)
}

export async function getContacts(accessToken: string): Promise<Contact[]> {
  return apiFetch<Contact[]>('/contacts', undefined, accessToken)
}

export async function getActivityLogs(accessToken: string): Promise<ActivityLog[]> {
  return apiFetch<ActivityLog[]>('/activity-logs', undefined, accessToken)
}

export async function createOrganization(
  payload: {
    name: string
    subscription_plan: 'Basic' | 'Pro'
    admin_email: string
    admin_password: string
    admin_username?: string
  },
  accessToken: string,
): Promise<void> {
  await apiFetch('/platform/organizations', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken)
}

export { ApiError }
