import { getDevRole } from '@/lib/dev'
import { getTenants, getTenantUsageStats } from '@/lib/tenants'
import { TenantsClient } from './tenants-client'

export async function TenantsHomeClient() {
    const [tenants, usageStats] = await Promise.all([getTenants(), getTenantUsageStats()])
    return <TenantsClient initialTenants={tenants} userRole={getDevRole()} usageStats={usageStats} />
}
