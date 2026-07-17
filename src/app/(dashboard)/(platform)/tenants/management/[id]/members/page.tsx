import { TenantsManagementidMembersClient } from "@/features/platform-tenants/management/[id]/members/TenantsManagementidMembersClient"

export const dynamic = 'force-dynamic'

export default async function OrgManagementMembers(props: any) {
    return <TenantsManagementidMembersClient {...props} />
}
