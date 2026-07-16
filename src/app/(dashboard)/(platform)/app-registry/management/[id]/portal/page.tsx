import { ApplicationManagementidPortalClient } from '@/features/app-registry/management/[id]/portal/ApplicationManagementidPortalClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationPortalPage(props: any) {
    return <ApplicationManagementidPortalClient {...props} />
}
