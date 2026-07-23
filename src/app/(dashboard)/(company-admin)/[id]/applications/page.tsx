import { TenantsManagementidApplicationsClient } from "@/features/platform-tenants/management/[id]/applications/TenantsManagementidApplicationsClient"

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationsPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params
    return <TenantsManagementidApplicationsClient basePath={`/${id}/applications`} />
}
