import { requireTenantAccess } from '@/lib/rbac'

export default async function TenantManagementLayout({
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
