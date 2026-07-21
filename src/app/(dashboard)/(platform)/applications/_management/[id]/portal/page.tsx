import { ApplicationManagementidPortalClient } from '@/features/platform-applications/management/portal/ApplicationManagementidPortalClient'

export default async function ApplicationPortalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ApplicationManagementidPortalClient appId={id} />
}
