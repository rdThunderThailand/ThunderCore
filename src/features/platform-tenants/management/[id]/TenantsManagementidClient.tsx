import { getTenantDashboard } from '@/lib/tenants'
import { notFound } from 'next/navigation'
import { OrgDashboardContent } from './org-dashboard-content'

interface PageProps {
    params: Promise<{ code: string }>
}

export async function TenantsManagementidClient({ params }: PageProps) {
    const { code } = await params
    const tenant = await getTenantDashboard(code)

    if (!tenant) {
        notFound()
    }

    const createdDate = tenant.createdAt
        ? new Date(tenant.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown'

    return (
        <OrgDashboardContent
            tenant={tenant}
            createdDate={createdDate}
        />
    )
}
