import { ApplicationManagementidPortalClient } from '@/features/platform-applications/management/portal/ApplicationManagementidPortalClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationPortalPage(props: { params: Promise<{ code: string; appId: string }> }) {
    const { code, appId } = await props.params
    return <ApplicationManagementidPortalClient appId={appId} basePath={`/${code}/applications`} />
}
