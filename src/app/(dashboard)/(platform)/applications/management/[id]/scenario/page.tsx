import { ApplicationManagementidScenarioClient } from '@/features/app-registry/management/[id]/scenario/ApplicationManagementidScenarioClient'

export const dynamic = 'force-dynamic'

export default async function ScenarioPage(props: any) {
    return <ApplicationManagementidScenarioClient {...props} />
}
