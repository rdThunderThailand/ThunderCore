import { ApplicationManagementidPortalCustomizationClient } from '@/features/app-registry/management/[id]/portal/customization/ApplicationManagementidPortalCustomizationClient'

export const dynamic = 'force-dynamic'

export default async function PortalCustomizationPage(props: any) {
    return <ApplicationManagementidPortalCustomizationClient {...props} />
}
