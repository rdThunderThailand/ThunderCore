import { TenantsHomeClient } from '@/features/platform-tenants/TenantsHomeClient'
import { requireRole } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export default async function TenantPage(props: any) {
    await requireRole('super_admin')
    return <TenantsHomeClient {...props} />
}
