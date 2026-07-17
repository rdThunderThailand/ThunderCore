import { OrgSettingsClient } from './org-settings-client'
import { MOCK_TENANTS } from '@/lib/mock/tenants'
import { mockUser } from '@/store/useAuthStore'

export async function TenantsManagementidSettingsClient({ params }: { params: Promise<{ id: string }> }) {


    return <OrgSettingsClient initialTenant={MOCK_TENANTS[0]} userRole={mockUser.role} />
}
