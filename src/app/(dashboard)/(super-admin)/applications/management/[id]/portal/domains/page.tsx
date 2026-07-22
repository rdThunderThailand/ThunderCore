import { ApplicationManagementidPortalDomainsClient } from '@/features/platform-applications/management/portal/domains/ApplicationManagementidPortalDomainsClient'

export default async function DomainSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ApplicationManagementidPortalDomainsClient appId={id} />
}
