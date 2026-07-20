import { redirect } from "next/navigation"

import { getDevRole, isDevBypass } from "@/lib/dev"
import { MOCK_TENANTS } from "@/lib/mock/tenants"
import { getCurrentUser, getMyMemberships, isAxiosError } from "@/lib/thunder-core"

export const dynamic = 'force-dynamic'

export default async function RedirectPage() {
    if (isDevBypass()) {
        const role = getDevRole()
        if (role === 'super_admin') redirect('/tenants')
        // ponytail: dev-bypass has no real membership data — stand in with the first mock tenant.
        if (role === 'company_admin') redirect(`/tenants/management/${MOCK_TENANTS[0].id}`)
        redirect('/dashboard')
    }

    let user
    let memberships
    try {
        ;[user, memberships] = await Promise.all([getCurrentUser(), getMyMemberships()])
    } catch (error) {
        // No/expired token → back to login. Anything else is a real fault; let it surface.
        if (isAxiosError(error) && error.response?.status === 401) redirect('/login')
        throw error
    }

    if (user.is_super_admin) redirect('/tenants')

    if (user.role === 'company_admin') {
        const tenantId =
            user.default_tenant_id ??
            memberships.find((m) => m.membership_roles.some((r) => r.roles.role_type === 'company_admin'))?.tenant_id
        if (tenantId) redirect(`/tenants/management/${tenantId}`)
    }

    redirect('/dashboard')
}
