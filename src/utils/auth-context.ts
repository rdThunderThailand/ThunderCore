'use server'

import { UserRole } from '@/types'
import { getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Authentication context returned by getAuthContext()
 */
export interface AuthContext {
    user: User
    role: UserRole
    supabase: SupabaseClient
    isSuperAdmin: boolean
    isAdminCompany: boolean
    isOrgAdmin: boolean
}

/**
 * Get authenticated user context with role information.
 * Use this at the start of every server action to avoid repeating auth code.
 * 
 * @throws Error if user is not authenticated
 * @returns AuthContext with user, role, and supabase client
 * 
 * @example
 * ```typescript
 * export async function myServerAction() {
 *     const { user, role, supabase, isSuperAdmin } = await getAuthContext()
 *     
 *     if (!isSuperAdmin) {
 *         throw new Error('Permission denied')
 *     }
 *     
 *     // ... rest of your action
 * }
 * ```
 */
export async function getAuthContext(): Promise<AuthContext> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        throw new Error('Unauthorized: You must be logged in to perform this action.')
    }

    const role = await getUserRole(supabase, user)

    // Derive isOrgAdmin from the resolved role (via membership_roles → roles(code))
    // Previously queried memberships.role which doesn't exist on the table
    const isOrgAdmin = role === 'company_admin' || role === 'super_admin'

    return {
        user,
        role,
        supabase,
        isSuperAdmin: role === 'super_admin',
        isAdminCompany: role === 'company_admin' || role === 'super_admin',
        isOrgAdmin
    }
}

/**
 * Get authenticated user context, requiring super_admin role.
 * 
 * @throws Error if user is not a super_admin
 */
export async function requireSuperAdmin(): Promise<AuthContext> {
    const context = await getAuthContext()

    if (!context.isSuperAdmin) {
        throw new Error('Permission denied: Super Admin access required.')
    }

    return context
}

/**
 * Get authenticated user context, requiring company_admin or super_admin role.
 * 
 * @throws Error if user is not an admin
 */
export async function requireAdmin(): Promise<AuthContext> {
    const context = await getAuthContext()

    if (!context.isAdminCompany && !context.isOrgAdmin) {
        throw new Error('Permission denied: Admin access required.')
    }

    return context
}

/**
 * Check if user is a member of a specific tenant.
 * 
 * @param tenantId - The tenant ID to check
 * @returns Object with membership info
 */
export async function getOrgMembership(tenantId: string) {
    const { user, supabase, isSuperAdmin, isAdminCompany } = await getAuthContext()

    const { data: membership } = await supabase
        .from('memberships')
        .select(`
            id,
            membership_roles (
                roles ( code )
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .single()

    // Extract the highest role code from membership_roles
    let orgRole: string | null = null
    if (membership) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mRoles = (membership.membership_roles as any[]) || []
        for (const mr of mRoles) {
            const code = mr.roles?.code as string
            if (code === 'owner') { orgRole = 'owner'; break }
            if (code === 'admin') orgRole = 'admin'
        }
    }

    return {
        isMember: !!membership,
        isOrgAdmin: orgRole === 'admin' || orgRole === 'owner',
        isOrgOwner: orgRole === 'owner',
        orgRole,
        isSuperAdmin,
        isAdminCompany
    }
}
