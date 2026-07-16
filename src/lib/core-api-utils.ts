import { SupabaseClient } from '@supabase/supabase-js'
import { UserRole } from '@/types'

// throw if not super_admin and not company_admin member of tenantId
export async function requireTenantAdmin(
    adminClient: SupabaseClient,
    userId: string,
    role: UserRole,
    tenantId: string
): Promise<void> {
    if (role === 'super_admin') return

    const { data: memberships, error } = await adminClient
        .from('memberships')
        .select(`
            status,
            membership_roles(
                roles(role_type)
            )
        `)
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')

    if (error || !memberships || memberships.length === 0) {
        throw new Error('Permission denied')
    }

    for (const membership of memberships) {
        if (membership.membership_roles && Array.isArray(membership.membership_roles)) {
            for (const mr of membership.membership_roles) {
                if (mr.roles && (mr.roles as { role_type?: unknown }).role_type === 'company_admin') {
                    return
                }
            }
        }
    }

    throw new Error('Permission denied')
}
