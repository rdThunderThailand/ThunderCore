import { ApplicationManagementidPortalClient } from '@/features/platform-applications/management/portal/ApplicationManagementidPortalClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationPortalPage(props: { params: Promise<{ id: string; appId: string }> }) {
    const { id, appId } = await props.params
    return <ApplicationManagementidPortalClient appId={appId} basePath={`/${id}/applications`} />
}
