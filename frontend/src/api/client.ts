import type { ActivityLog, AuthTokens, Company, Contact, UserProfile } from '../types'

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'
const API_BASE_URL = RAW_API_BASE_URL.endsWith('/') ? RAW_API_BASE_URL.slice(0, -1) : RAW_API_BASE_URL

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function withQuery(path: string, params?: Record<string, string | number | undefined | null>) {
  if (!params) return path
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `${path}?${query}` : path
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  const [pathname, query = ''] = path.split('?', 2)
  const normalizedPathname = pathname.endsWith('/') ? pathname : `${pathname}/`
  return query ? `${normalizedPathname}?${query}` : normalizedPathname
}

async function apiFetch<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const headers = new Headers(init?.headers ?? {})
  headers.set('Content-Type', 'application/json')
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const payload = await response.json()
      if (payload?.detail) {
        detail = payload.detail
      } else if (typeof payload === 'object' && payload !== null) {
        const firstEntry = Object.entries(payload)[0]
        if (firstEntry) {
          const [field, value] = firstEntry
          if (Array.isArray(value) && value.length) {
            detail = `${field}: ${String(value[0])}`
          } else {
            detail = `${field}: ${String(value)}`
          }
        }
      }
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
  const payload = await apiFetch<Company[] | PaginatedResponse<Company>>('/companies', undefined, accessToken)
  return Array.isArray(payload) ? payload : payload.results
}

export async function listCompanies(
  accessToken: string,
  params?: { search?: string; industry?: string; country?: string; page?: number },
): Promise<PaginatedResponse<Company>> {
  return apiFetch<PaginatedResponse<Company>>(withQuery('/companies', params), undefined, accessToken)
}

export async function getCompany(accessToken: string, id: number): Promise<Company> {
  return apiFetch<Company>(`/companies/${id}`, undefined, accessToken)
}

export async function createCompany(
  accessToken: string,
  payload: { name: string; industry: string; country: string; organization?: number },
): Promise<Company> {
  return apiFetch<Company>('/companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken)
}

export async function updateCompany(
  accessToken: string,
  id: number,
  payload: Partial<{ name: string; industry: string; country: string; organization: number }>,
): Promise<Company> {
  return apiFetch<Company>(`/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, accessToken)
}

export async function deleteCompany(accessToken: string, id: number): Promise<void> {
  await apiFetch<void>(`/companies/${id}`, { method: 'DELETE' }, accessToken)
}

export async function getContacts(accessToken: string): Promise<Contact[]> {
  const payload = await apiFetch<Contact[] | PaginatedResponse<Contact>>('/contacts', undefined, accessToken)
  return Array.isArray(payload) ? payload : payload.results
}

export async function listContacts(
  accessToken: string,
  params?: { search?: string; company_id?: number; role?: string; page?: number },
): Promise<PaginatedResponse<Contact>> {
  return apiFetch<PaginatedResponse<Contact>>(withQuery('/contacts', params), undefined, accessToken)
}

export async function createContact(
  accessToken: string,
  payload: { company: number; full_name: string; email: string; phone?: string; role: string; organization?: number },
): Promise<Contact> {
  return apiFetch<Contact>('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken)
}

export async function updateContact(
  accessToken: string,
  id: number,
  payload: Partial<{ company: number; full_name: string; email: string; phone: string; role: string; organization: number }>,
): Promise<Contact> {
  return apiFetch<Contact>(`/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, accessToken)
}

export async function deleteContact(accessToken: string, id: number): Promise<void> {
  await apiFetch<void>(`/contacts/${id}`, { method: 'DELETE' }, accessToken)
}

export async function getActivityLogs(accessToken: string): Promise<ActivityLog[]> {
  const payload = await apiFetch<ActivityLog[] | PaginatedResponse<ActivityLog>>('/activity-logs', undefined, accessToken)
  return Array.isArray(payload) ? payload : payload.results
}

export async function listActivityLogs(
  accessToken: string,
  params?: {
    action_type?: 'CREATE' | 'UPDATE' | 'DELETE'
    model_name?: string
    user_id?: number
    date_from?: string
    date_to?: string
    search?: string
    page?: number
  },
): Promise<PaginatedResponse<ActivityLog>> {
  return apiFetch<PaginatedResponse<ActivityLog>>(withQuery('/activity-logs', params), undefined, accessToken)
}

export async function createOrganization(
  payload: {
    name: string
    subscription_plan: 'Basic' | 'Pro'
    admin_email: string
    admin_password: string
    admin_username?: string
  },
): Promise<void> {
  await apiFetch('/auth/register-organization', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export { ApiError }
