import { ApplicationManagementidPortalDomainsClient } from '@/features/platform-applications/management/portal/domains/ApplicationManagementidPortalDomainsClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationPortalDomainsPage(props: { params: Promise<{ id: string; appId: string }> }) {
    const { id, appId } = await props.params
    return <ApplicationManagementidPortalDomainsClient appId={appId} basePath={`/${id}/applications`} />
}
