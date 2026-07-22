import { TenantsManagementidAssetsClient } from "@/features/platform-tenants/management/[id]/assets/TenantsManagementidAssetsClient"

export const dynamic = 'force-dynamic'

export default async function AssetsPage(props: any) {
    return <TenantsManagementidAssetsClient {...props} />

}
