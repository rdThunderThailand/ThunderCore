// Single server-side axios client for the Thunder Core core/v1 API.
// The app API key is a secret — this module must only be imported from Server
// Components / Server Actions, never from a 'use client' file.

import axios, { isAxiosError } from 'axios'
import { cookies } from 'next/headers'

const ACCESS_TOKEN_COOKIE = 'tc_access_token'

export type ThunderRole =
  | 'super_admin'
  | 'company_admin'
  | 'executive_viewer'
  | 'operator'
  | 'viewer_auditor'

export type CurrentUser = {
  id: string
  global_user_code: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  avatar_url: string | null
  preferred_language: string
  timezone: string
  is_super_admin: boolean
  default_tenant_id: string | null
  role: ThunderRole
}

export type MembershipRole = {
  role_id: string
  roles: { id: string; code: string; name: string; role_type: string }
}

export type Membership = {
  id: string
  tenant_id: string
  status: 'invited' | 'active'
  is_primary: boolean
  default_department_id: string | null
  joined_at: string
  tenants: { id: string; name: string }
  membership_roles: MembershipRole[]
}

export type LoginSession = {
  access_token: string
  refresh_token: string
  expires_at: number
  user_id: string
}

type ThunderResponse<T> = { success: boolean; data: T; error?: string }

// Single shared instance. baseURL + x-api-key are attached per-request so a
// missing/late env var surfaces as a real error instead of a silent bad URL.
export const thunderCore = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

thunderCore.interceptors.request.use(async (config) => {
  const baseUrl = process.env.THUNDER_CORE_URL
  const apiKey = process.env.THUNDER_CORE_APP_API_KEY

  if (!baseUrl || !apiKey) {
    throw new Error('Thunder Core env not configured (THUNDER_CORE_URL / THUNDER_CORE_APP_API_KEY)')
  }

  config.baseURL = `${baseUrl.replace(/\/+$/, '')}/api/core/v1`
  config.headers.set('x-api-key', apiKey)

  // Bearer is present for user-scoped calls (/me, ...) and absent at login time.
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value
  if (token) config.headers.set('Authorization', `Bearer ${token}`)

  return config
})

export async function loginRequest(email: string, password: string): Promise<LoginSession> {
  const res = await thunderCore.post<ThunderResponse<LoginSession>>('/auth/login', { email, password })
  return res.data.data
}

export type RegisterResult = { user_id: string; email: string; global_user_code: string }

export async function registerRequest(email: string, password: string): Promise<RegisterResult> {
  const res = await thunderCore.post<ThunderResponse<RegisterResult>>('/auth/register', { email, password })
  return res.data.data
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const res = await thunderCore.get<ThunderResponse<CurrentUser>>('/me')
  console.log('getCurrentUser', res.data.data)
  return res.data.data
}

export async function getMyMemberships(): Promise<Membership[]> {
  const res = await thunderCore.get<ThunderResponse<Membership[]>>('/me/memberships')
  console.log('getMyMemberships', res.data.data)
  return res.data.data
}

export { isAxiosError }
