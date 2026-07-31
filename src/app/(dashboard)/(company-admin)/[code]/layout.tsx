import { notFound } from 'next/navigation'
import { requireCompanyAdminAccess } from '@/lib/rbac'
import { getTenant } from '@/lib/tenants'

export default async function CompanyAdminTenantLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ code: string }>
}) {
    const { code } = await params
    const tenant = await getTenant(code)
    if (!tenant) notFound()
    await requireCompanyAdminAccess(tenant.id)
    return <>{children}</>
}
