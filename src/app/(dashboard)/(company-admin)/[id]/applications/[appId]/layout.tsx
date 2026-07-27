import { notFound } from 'next/navigation'
import { getApplicationById } from '@/lib/applications'

export default async function CompanyAdminApplicationLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string; appId: string }>
}) {
    const { id: tenantId, appId } = await params
    const app = await getApplicationById(appId)
    if (!app || app.tenant_id !== tenantId) notFound()


    return <>{children}</>
}
