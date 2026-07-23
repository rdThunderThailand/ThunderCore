import { requireTenantAccess } from '@/lib/rbac'

export default async function CompanyAdminTenantLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    await requireTenantAccess(id)
    return <>{children}</>
}
