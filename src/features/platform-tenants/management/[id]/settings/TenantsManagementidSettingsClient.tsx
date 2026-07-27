import { OrgSettingsClient } from './org-settings-client'
import { MOCK_TENANTS } from '@/lib/mock/tenants'
import { mockUser } from '@/store/useAuthStore'
import { getTenant } from '@/lib/tenants'
import { getCurrentUser } from '@/lib/thunder-core'
import { redirect } from 'next/navigation'

export async function TenantsManagementidSettingsClient({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params
    // const tenant = MOCK_TENANTS.find((t) => t.id === id) ?? MOCK_TENANTS[0]
    const [tenant, user] = await Promise.all([getTenant(id), getCurrentUser()])
    if (!tenant) {
        redirect('no-access')
    }
    return <OrgSettingsClient initialTenant={tenant} userRole={user.role} />
}
