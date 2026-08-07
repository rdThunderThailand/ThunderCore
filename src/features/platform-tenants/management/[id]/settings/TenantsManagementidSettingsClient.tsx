import { OrgSettingsClient } from './org-settings-client'
import { MOCK_TENANTS } from '@/lib/mock/tenants'
import { mockUser } from '@/store/useAuthStore'
import { getTenant } from '@/lib/tenants'
import { getCurrentUser } from '@/lib/thunder-core'
import { redirect } from 'next/navigation'

export async function TenantsManagementidSettingsClient({ params }: { params: Promise<{ code: string }> }) {

    const { code } = await params
    const [tenant, user] = await Promise.all([getTenant(code), getCurrentUser()])

    if (!tenant) {
        redirect('no-access')
    }
    return <OrgSettingsClient initialTenant={tenant} userRole={user.role} />
}
