import { ApplicationManagementidMembersClient } from '@/features/platform-applications/management/members/ApplicationManagementidMembersClient'

export default async function ApplicationMembersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ApplicationManagementidMembersClient appId={id} />
}
