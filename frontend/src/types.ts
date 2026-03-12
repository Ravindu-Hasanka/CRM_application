export type SubscriptionPlan = 'Basic' | 'Pro'
export type UserRole = 'SystemAdmin' | 'Admin' | 'Manager' | 'Staff'

export interface AuthTokens {
  access: string
  refresh: string
}

export interface UserProfile {
  id: number
  email: string
  username: string | null
  organization_id: number | null
  organization_name?: string | null
  organization_logo?: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface OrganizationProfile {
  id: number
  name: string
  subscription_plan: SubscriptionPlan
  logo: string | null
  logo_url: string | null
  created_at: string
}

export interface Company {
  id: number
  organization_id: number
  name: string
  industry: string
  country: string
  logo: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Contact {
  id: number
  organization_id: number
  company_id: number
  full_name: string
  email: string
  phone: string
  role: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: number
  organization_id: number
  user_id: number | null
  user_email?: string | null
  action_type: 'CREATE' | 'UPDATE' | 'DELETE'
  model_name: string
  object_id: string
  timestamp: string
  metadata: Record<string, unknown> | null
}

export interface RegistrationDraft {
  subscriptionPlan: SubscriptionPlan
  organizationName: string
  adminEmail: string
  adminUsername: string
}
