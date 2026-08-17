import { ApplicationManagementidPortalDomainsClient } from '@/features/platform-applications/management/portal/domains/ApplicationManagementidPortalDomainsClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationPortalDomainsPage(props: { params: Promise<{ code: string; appId: string }> }) {
    const { code, appId } = await props.params
    return <ApplicationManagementidPortalDomainsClient appId={appId} basePath={`/${code}/applications`} />
}
