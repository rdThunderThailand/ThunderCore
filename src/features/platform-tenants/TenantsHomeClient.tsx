import { Tenant } from '@/types'
import { getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTenants, getTenantUsageStats } from './actions'
import { TenantsClient } from './tenants-client'

export async function TenantsHomeClient() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const role = await getUserRole(supabase, user)

    // Only Super Admin can access this page (SD-002-1, SD-002-4)
    if (role !== 'super_admin') {
        redirect('/dashboard')
    }

    let tenants: Tenant[] = []
    let usageStats = undefined

    try {
        tenants = await getTenants()
        // Fetch usage statistics (SD-002-4)
        usageStats = await getTenantUsageStats()
    } catch (error) {
        console.error('Error fetching tenants:', error)
        // Continue with empty array - error will be shown in client
    }

    return <TenantsClient initialTenants={tenants} userRole={role} usageStats={usageStats} />
}