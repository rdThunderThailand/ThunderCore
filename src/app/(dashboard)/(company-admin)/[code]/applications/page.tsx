import { TenantsManagementidApplicationsClient } from "@/features/platform-tenants/management/[id]/applications/TenantsManagementidApplicationsClient"

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationsPage(props: { params: Promise<{ code: string }> }) {
    const { code } = await props.params
    return <TenantsManagementidApplicationsClient basePath={`/${code}/applications`} />
}
