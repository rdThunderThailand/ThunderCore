import { OrgSettingsClient } from './org-settings-client'
import { MOCK_TENANTS } from '@/lib/mock/tenants'
import { mockUser } from '@/store/useAuthStore'

export async function TenantsManagementidSettingsClient({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params
    const tenant = MOCK_TENANTS.find((t) => t.id === id) ?? MOCK_TENANTS[0]
    // console.log('tenant', tenant)

    return <OrgSettingsClient initialTenant={tenant} userRole={mockUser.role} />
}
