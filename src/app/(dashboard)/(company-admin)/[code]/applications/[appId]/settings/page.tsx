import { ApplicationManagementidSettingsClient } from '@/features/platform-applications/management/setting/ApplicationManagementidSettingsClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationSettingsPage(props: { params: Promise<{ code: string; appId: string }> }) {
    const { code, appId } = await props.params
    return <ApplicationManagementidSettingsClient appId={appId} tenantId={code} />
}
