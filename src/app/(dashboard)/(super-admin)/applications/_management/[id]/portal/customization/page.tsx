import { ApplicationManagementidPortalCustomizationClient } from '@/features/platform-applications/management/portal/customization/ApplicationManagementidPortalCustomizationClient'

export default async function PortalCustomizationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ApplicationManagementidPortalCustomizationClient appId={id} />
}
