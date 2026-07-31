import { ApplicationManagementidPortalCustomizationClient } from '@/features/platform-applications/management/portal/customization/ApplicationManagementidPortalCustomizationClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationPortalCustomizationPage(props: { params: Promise<{ id: string; appId: string }> }) {
    const { id, appId } = await props.params
    return <ApplicationManagementidPortalCustomizationClient appId={appId} basePath={`/${id}/applications`} />
}
