import { ApplicationManagementidMembersClient } from '@/features/platform-applications/management/members/ApplicationManagementidMembersClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminApplicationMembersPage(props: { params: Promise<{ code: string; appId: string }> }) {
    const { code, appId } = await props.params
    return <ApplicationManagementidMembersClient appId={appId} tenantId={code} basePath={`/${code}/applications`} />
}
