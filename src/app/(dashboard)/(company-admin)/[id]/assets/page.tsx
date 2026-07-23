import { TenantsManagementidAssetsClient } from "@/features/platform-tenants/management/[id]/assets/TenantsManagementidAssetsClient"

export const dynamic = 'force-dynamic'

export default async function CompanyAdminAssetsPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params
    return <TenantsManagementidAssetsClient basePath={`/${id}`} />
}
