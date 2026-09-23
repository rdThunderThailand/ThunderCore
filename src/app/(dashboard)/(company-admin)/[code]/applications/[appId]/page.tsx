import { ApplicationManagementidClient } from '@/features/platform-applications/management/ApplicationManagementidClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationDashboardPage(props: { params: Promise<{ code: string; appId: string }> }) {
    const { code, appId } = await props.params
    return <ApplicationManagementidClient appId={appId} basePath={`/${code}/applications`} />
}
