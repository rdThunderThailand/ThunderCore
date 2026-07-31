import { TenantsManagementidSettingsClient } from '@/features/platform-tenants/management/[id]/settings/TenantsManagementidSettingsClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminSettingsPage(props: { params: Promise<{ code: string }> }) {

    return <TenantsManagementidSettingsClient {...props} />
}
