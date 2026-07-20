import { ApplicationManagementidSettingsClient } from '@/features/platform-applications/management/setting/ApplicationManagementidSettingsClient'

export default async function ApplicationSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ApplicationManagementidSettingsClient appId={id} />
}
