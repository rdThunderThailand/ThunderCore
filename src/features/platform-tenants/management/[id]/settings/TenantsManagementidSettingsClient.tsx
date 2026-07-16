import { getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTenantById } from '../../../actions'
import { OrgSettingsClient } from './org-settings-client'

export async function TenantsManagementidSettingsClient({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const role = await getUserRole(supabase, user)

    // Admin and Super Admin can access (SD-002-2)
    if (role !== 'super_admin' && role !== 'company_admin') {
        redirect('/dashboard')
    }

    let tenant
    try {
        tenant = await getTenantById(id)
    } catch (error) {
        console.error('Error fetching tenant:', error)
        redirect('/dashboard/tenants')
    }

    return <OrgSettingsClient initialTenant={tenant} userRole={role} />
}
