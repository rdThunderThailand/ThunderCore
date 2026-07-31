import { ApplicationManagementidClient } from '@/features/platform-applications/management/ApplicationManagementidClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationDashboardPage(props: { params: Promise<{ id: string; appId: string }> }) {
    const { id, appId } = await props.params
    return <ApplicationManagementidClient appId={appId} basePath={`/${id}/applications`} />
}
