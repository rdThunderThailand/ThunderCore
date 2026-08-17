import { TenantsManagementidMembersmemberIdSettingsClient } from "@/features/platform-tenants/management/[id]/members/[memberId]/settings/TenantsManagementidMembersmemberIdSettingsClient"

export const dynamic = 'force-dynamic'

export default async function MemberSettingsPage(props: any) {

    return <TenantsManagementidMembersmemberIdSettingsClient {...props} />

}
