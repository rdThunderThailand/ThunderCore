import { notFound } from 'next/navigation'
import { requireTenantAccess } from '@/lib/rbac'
import { getTenant } from '@/lib/tenants'

export default async function TenantManagementLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ code: string }>
}) {
    const { code } = await params
    const tenant = await getTenant(code)
    if (!tenant) notFound()
    await requireTenantAccess(tenant.id)
    return <>{children}</>
}
