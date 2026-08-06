import { ApplicationManagementidPortalCustomizationClient } from '@/features/platform-applications/management/portal/customization/ApplicationManagementidPortalCustomizationClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationPortalCustomizationPage(props: { params: Promise<{ code: string; appId: string }> }) {
    const { code, appId } = await props.params
    return <ApplicationManagementidPortalCustomizationClient appId={appId} basePath={`/${code}/applications`} />
}
