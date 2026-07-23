import { ApplicationManagementidMembersClient } from '@/features/platform-applications/management/members/ApplicationManagementidMembersClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationMembersPage(props: { params: Promise<{ id: string; appId: string }> }) {
    const { id, appId } = await props.params
    return <ApplicationManagementidMembersClient appId={appId} basePath={`/${id}/applications`} />
}
