import { ApplicationManagementidScenarioClient } from '@/features/platform-applications/management/scenario/ApplicationManagementidScenarioClient'

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ApplicationManagementidScenarioClient appId={id} />
}
