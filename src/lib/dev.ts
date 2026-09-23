import { UserRole } from '@/types/auth'

// ponytail: dev-only bypass so the frontend runs before Thunder Core REST exists.
// Both flags are NEXT_PUBLIC so client (Header/SideBar) and server (seam) agree.

const ROLES: UserRole[] = ['super_admin', 'executive_viewer', 'company_admin', 'viewer_auditor', 'operator']

/** true = skip real API/auth, serve mock data. Off in prod unless explicitly set. */
export function isDevBypass(): boolean {
    return process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
}

/** Role to act as while bypassing. Swap NEXT_PUBLIC_DEV_ROLE in .env. Defaults to super_admin. */
export function getDevRole(): UserRole {
    const role = process.env.NEXT_PUBLIC_DEV_ROLE as UserRole
    return ROLES.includes(role) ? role : 'super_admin'
}
