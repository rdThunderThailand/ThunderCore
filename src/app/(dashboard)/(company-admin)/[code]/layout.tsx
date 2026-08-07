import { notFound, redirect } from 'next/navigation'
import { requireCompanyAdminAccess } from '@/lib/rbac'
import { getTenant } from '@/lib/tenants'
import { isAxiosError } from '@/lib/thunder-core'

export default async function CompanyAdminTenantLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ code: string }>
}) {
    const { code } = await params

    // Thunder Core's GET /tenants/:id itself gates on tenant-admin membership, so a caller
    // without an active company_admin membership for this tenant gets a 403 here — before
    // requireCompanyAdminAccess below ever runs. Treat that the same as failing the RBAC gate.
    let tenant
    try {
        tenant = await getTenant(code)
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) redirect('/no-access')
        throw error
    }

    if (!tenant) notFound()
    await requireCompanyAdminAccess(tenant.id)
    return <>{children}</>
}
