import { TenantsManagementidAssetsClient } from "@/features/platform-tenants/management/[id]/assets/TenantsManagementidAssetsClient"
import { resolveCurrentUser } from "@/lib/current-user"

export const dynamic = 'force-dynamic'

export default async function CompanyAdminAssetsPage(props: { params: Promise<{ code: string }> }) {
    const { code } = await props.params
    const user = await resolveCurrentUser()
    return <TenantsManagementidAssetsClient basePath={`/${code}`} user={user} />
}
