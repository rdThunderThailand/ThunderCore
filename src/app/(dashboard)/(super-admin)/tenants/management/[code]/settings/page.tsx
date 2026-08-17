import { TenantsManagementidSettingsClient } from "@/features/platform-tenants/management/[id]/settings/TenantsManagementidSettingsClient"

export const dynamic = 'force-dynamic'

export default async function OrgManagementSettings(props: any) {
    return <TenantsManagementidSettingsClient {...props} />
}
