import { ApplicationManagementidClient } from '@/features/app-registry/management/[id]/ApplicationManagementidClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationDashboard(props: any) {
    return <ApplicationManagementidClient {...props} />
}
