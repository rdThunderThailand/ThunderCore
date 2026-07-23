import { TenantsManagementidMembersClient } from "@/features/platform-tenants/management/[id]/members/TenantsManagementidMembersClient"
export const dynamic = 'force-dynamic'

// ponytail: stub, no guard/logic yet — company-admin route split is WIP.
export default function CompanyAdminMembersPage() {
    return (
        <>
            <div>รวมทุก member</div>
            <TenantsManagementidMembersClient />
        </>

    )

}
