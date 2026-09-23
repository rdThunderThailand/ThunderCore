import { TenantsManagementidApplicationsClient } from "@/features/platform-tenants/management/[id]/applications/TenantsManagementidApplicationsClient"

export const dynamic = 'force-dynamic'

export default async function OrgManagementApplications(props: any) {
    return <TenantsManagementidApplicationsClient {...props} />
}
