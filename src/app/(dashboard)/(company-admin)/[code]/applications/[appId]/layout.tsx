import { notFound } from 'next/navigation'
import { getApplicationById } from '@/lib/applications'
import { getTenant } from '@/lib/tenants'

export default async function CompanyAdminApplicationLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ code: string; appId: string }>
}) {
    const { code, appId } = await params
    const tenant = await getTenant(code)
    if (!tenant) notFound()
    const app = await getApplicationById(appId)
    if (!app || app.tenant_id !== tenant.id) notFound()

    return <>{children}</>
}
