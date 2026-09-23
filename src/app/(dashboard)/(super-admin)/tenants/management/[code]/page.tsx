import { TenantsManagementidClient } from "@/features/platform-tenants/management/[id]/TenantsManagementidClient"

export const dynamic = 'force-dynamic'

export default async function OrgManagementOverview(props: any) {
    return <TenantsManagementidClient {...props} />
    // return <div className="">Peach</div>

}
