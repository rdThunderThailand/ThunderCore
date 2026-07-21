import { notFound } from 'next/navigation'

import { getApplicationById } from '@/lib/applications'
import { requireRole, requireTenantAccess } from '@/lib/rbac'

export default async function ApplicationManagementLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const app = await getApplicationById(id)
    if (!app) notFound()

    // Platform-wide (shared) apps have no owner tenant to scope a company_admin to.
    if (app.tenant_id) {
        await requireTenantAccess(app.tenant_id)
    } else {
        await requireRole('super_admin')
    }

    return <>{children}</>
}
