// Server-only RBAC gate. This is UX only — Thunder_Core enforces the real
// permission on every request (requireSuperAdmin / requireTenantAdmin server-side).
// Never import this from a 'use client' file (it pulls in thunder-core.ts, which
// touches cookies() and the app api key).

import { redirect } from 'next/navigation'

import { isDevBypass, getDevRole } from './dev'
import { getCurrentUser, getMyMemberships, isAxiosError, type ThunderRole } from './thunder-core'

const TIERS: ThunderRole[] = [
    'operator',
    'viewer_auditor',
    'company_admin',
    'executive_viewer',
    'super_admin',
]

type SessionUser = {
    role: ThunderRole
    isSuperAdmin: boolean
}

async function getSessionUser(): Promise<SessionUser | null> {
    if (isDevBypass()) {
        const role = getDevRole()
        return { role, isSuperAdmin: role === 'super_admin' }
    }

    try {
        const user = await getCurrentUser()
        return { role: user.role, isSuperAdmin: user.is_super_admin }
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) return null
        throw error
    }
}

export async function hasAtLeast(tier: ThunderRole): Promise<boolean> {
    const session = await getSessionUser()
    if (!session) return false
    return TIERS.indexOf(session.role) >= TIERS.indexOf(tier)
}

/** Redirects to /login if unauthenticated, /dashboard if authenticated below `tier`. */
export async function requireRole(tier: ThunderRole): Promise<void> {
    const session = await getSessionUser()
    if (!session) redirect('/login')
    if (TIERS.indexOf(session.role) < TIERS.indexOf(tier)) redirect('/dashboard')
}

/**
 * Passes for super_admin, or a company_admin who is a member of `tenantId`.
 * ponytail: dev-bypass has no per-tenant membership mock, so company_admin passes for any tenant.
 */
export async function requireTenantAccess(tenantId: string): Promise<void> {
    const session = await getSessionUser()
    if (isDevBypass()) return
    if (!session) redirect('/login')
    if (session.isSuperAdmin) return
    if (session.role !== 'company_admin') redirect('/dashboard')

    const memberships = await getMyMemberships()
    const isTenantCompanyAdmin = memberships.some(
        (m) => m.tenant_id === tenantId && m.membership_roles.some((r) => r.roles.role_type === 'company_admin')
    )
    if (!isTenantCompanyAdmin) redirect('/dashboard')
}
