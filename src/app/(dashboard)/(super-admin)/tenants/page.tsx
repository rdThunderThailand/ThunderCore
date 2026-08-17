import { TenantsHomeClient } from '@/features/platform-tenants/TenantsHomeClient'

export const dynamic = 'force-dynamic'

export default async function TenantPage(props: any) {
    return <TenantsHomeClient {...props} />
}
