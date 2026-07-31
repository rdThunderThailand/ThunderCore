import { requireCompanyAdminAccess } from '@/lib/rbac'

export default async function CompanyAdminTenantLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    await requireCompanyAdminAccess(id)
    return <>{children}</>
}
