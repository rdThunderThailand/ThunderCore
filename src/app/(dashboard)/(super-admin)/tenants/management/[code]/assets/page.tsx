import { TenantsManagementidAssetsClient } from "@/features/platform-tenants/management/[id]/assets/TenantsManagementidAssetsClient"
import { resolveCurrentUser } from "@/lib/current-user"

export const dynamic = 'force-dynamic'

export default async function AssetsPage(props: any) {
    const user = await resolveCurrentUser()
    return <TenantsManagementidAssetsClient {...props} user={user} />
}
