import { ApplicationManagementidClient } from '@/features/platform-applications/management/ApplicationManagementidClient'

export default async function ApplicationDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ApplicationManagementidClient appId={id} />
}
