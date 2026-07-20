import { Tenant, TenantDashboard } from '@/types/tenants'
import { getTenantQuota } from './assets'
import { isDevBypass } from './dev'
import { MOCK_ASSETS } from './mock/assets'
import { MOCK_MEMBERS } from './mock/members'
import { MOCK_TENANT_ACTIVITY } from './mock/tenant-activity'
import { MOCK_TENANTS, MOCK_TENANT_USAGE } from './mock/tenants'

// Living endpoint catalog — each signature is the future REST contract.
// Swap the body to axios (GET core/v1/tenants) when the endpoint lands; callers don't change.

export async function getTenants(): Promise<Tenant[]> {
    if (isDevBypass()) return MOCK_TENANTS
    // ponytail: Supabase shim — replace with axios GET core/v1/tenants when it exists
    throw new Error('getTenants: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data')
}

export async function getTenantUsageStats(): Promise<typeof MOCK_TENANT_USAGE> {
    if (isDevBypass()) return MOCK_TENANT_USAGE
    // ponytail: Supabase shim — replace with axios GET core/v1/tenants/usage when it exists
    throw new Error('getTenantUsageStats: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data')
}

type TenantInput = { name: string; type: Tenant['type']; status: Tenant['status'] }

export async function createTenant(data: TenantInput): Promise<Tenant> {
    if (!isDevBypass()) throw new Error('createTenant: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    const newTenant: Tenant = {
        id: crypto.randomUUID(),
        name: data.name,
        type: data.type,
        status: data.status,
        memberCount: 0,
        appCount: 0,
        deviceQuota: 50,
        deviceCount: 0,
        createdAt: new Date().toISOString(),
    }
    MOCK_TENANTS.unshift(newTenant)
    return newTenant
}

export async function updateTenant(id: string, data: Partial<TenantInput>): Promise<Tenant> {
    if (!isDevBypass()) throw new Error('updateTenant: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    const index = MOCK_TENANTS.findIndex((t) => t.id === id)
    if (index !== -1) {
        MOCK_TENANTS[index] = { ...MOCK_TENANTS[index], ...data }
        return MOCK_TENANTS[index]
    }
    const base = MOCK_TENANTS[0]
    return { ...base, id, ...data }
}

export async function deleteTenant(id: string): Promise<void> {
    if (!isDevBypass()) throw new Error('deleteTenant: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    const index = MOCK_TENANTS.findIndex((t) => t.id === id)
    if (index !== -1) {
        MOCK_TENANTS.splice(index, 1)
    }
}

export async function getTenantDashboard(tenantId: string): Promise<TenantDashboard | null> {
    if (isDevBypass()) {
        const tenant = MOCK_TENANTS.find((t) => t.id === tenantId)
        if (!tenant) return null

        const quota = await getTenantQuota(tenantId)

        const playerStatus = { online: 0, offline: 0, busy: 0, error: 0, total: 0 }
        MOCK_ASSETS.filter((a) => a.tenant_id === tenantId).forEach((a) => {
            playerStatus.total++
            if (a.connection_status === 'online') playerStatus.online++
            else if (a.connection_status === 'offline') playerStatus.offline++
            else if (a.connection_status === 'busy') playerStatus.busy++
            else playerStatus.error++
        })

        const members = MOCK_MEMBERS.filter((m) => m.tenant_id === tenantId).map((m) => {
            const fullName = m.user?.full_name ?? ''
            const [firstName, ...rest] = fullName.split(' ')
            return {
                id: m.id,
                role: m.role,
                created_at: m.joined_at,
                profile: { first_name: firstName ?? '', last_name: rest.join(' ') },
            }
        })

        const recentLogs = MOCK_TENANT_ACTIVITY
            .filter((log) => log.tenant_id === tenantId)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))

        return {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status,
            type: tenant.type,
            quota: {
                max_assets: quota.total,
                used_assets: quota.used,
                max_storage_mb: 50 * 1024,
                used_storage_mb: 0,
            },
            playerStatus,
            members,
            recentLogs,
            createdAt: tenant.createdAt,
        }
    }
    // ponytail: Supabase shim — replace with axios GET core/v1/tenants/:id/dashboard when it exists
    throw new Error('getTenantDashboard: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data')
}
