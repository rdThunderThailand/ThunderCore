import { TenantsManagementidApplicationsClient } from '@/features/platform-tenants/management/[id]/applications/TenantsManagementidApplicationsClient'

export const dynamic = 'force-dynamic'

export default async function OrgManagementDashboard(props: any) {
    return (
        <div className="">
            Dashboard
        </div>
    )
    // return <TenantsManagementidApplicationsClient {...props} />
}
