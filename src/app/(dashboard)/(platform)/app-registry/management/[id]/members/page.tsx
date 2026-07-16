import { ApplicationManagementidMembersClient } from '@/features/app-registry/management/[id]/members/ApplicationManagementidMembersClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationMembersPage(props: any) {
    return <ApplicationManagementidMembersClient {...props} />
}
