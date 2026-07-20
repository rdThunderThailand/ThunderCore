import { Tenant, TenantDashboard } from '@/types/tenants'
import { getTenantQuota } from './assets'
import { isDevBypass } from './dev'
import { MOCK_ASSETS } from './mock/assets'
import { MOCK_MEMBERS } from './mock/members'
import { MOCK_TENANT_ACTIVITY } from './mock/tenant-activity'
import { MOCK_TENANTS, MOCK_TENANT_USAGE } from './mock/tenants'
import { thunderCore } from './thunder-core'

// Living endpoint catalog — each signature is the REST contract.
// Backed by Thunder Core core/v1/tenants. Requests send snake_case (they mirror DB columns),
// responses come back camelCase (they mirror the Tenant view model) — that asymmetry is the
// server's contract, not an oversight here.

type ThunderResponse<T> = { success: boolean; data: T }

export async function getTenants(): Promise<Tenant[]> {
    if (isDevBypass()) return MOCK_TENANTS
    const res = await thunderCore.get<ThunderResponse<Tenant[]>>('/tenants')
    return res.data.data
}

export type TenantUsageStats = {
    totalTenants: number
    activeTenants: number
    totalApps: number
    totalMembers: number
}

export async function getTenantUsageStats(): Promise<TenantUsageStats> {
    if (isDevBypass()) return MOCK_TENANT_USAGE
    const res = await thunderCore.get<ThunderResponse<TenantUsageStats>>('/tenants/usage')
    return res.data.data
}

export async function getTenant(id: string): Promise<Tenant | null> {
    if (isDevBypass()) return MOCK_TENANTS.find((t) => t.id === id) ?? null
    const res = await thunderCore.get<ThunderResponse<Tenant>>(`/tenants/${id}`)
    return res.data.data
}

export type TenantInput = {
    name: string
    type: Tenant['type']
    status: Tenant['status']
    contact_email?: string
    website_url?: string
    description?: string
}

export async function createTenant(data: TenantInput): Promise<Tenant> {
    if (isDevBypass()) {
        // ponytail: echo a shaped row so the client can render it; the real POST returns the
        // server row. Not persisted across requests in bypass mode.
        return {
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
    }
    // tenant_code is generated server-side — nothing to send for it.
    const res = await thunderCore.post<ThunderResponse<Tenant>>('/tenants', data)
    return res.data.data
}

export async function updateTenant(id: string, data: Partial<TenantInput>): Promise<Tenant> {
    if (isDevBypass()) {
        const base = MOCK_TENANTS.find((t) => t.id === id) ?? MOCK_TENANTS[0]
        return { ...base, id, ...data }
    }
    // The server rejects any key outside its whitelist with a 400 rather than ignoring it,
    // so never spread extra state into `data` here.
    const res = await thunderCore.patch<ThunderResponse<Tenant>>(`/tenants/${id}`, data)
    return res.data.data
}

export async function deleteTenant(id: string): Promise<void> {
    if (isDevBypass()) return // ponytail: no-op in bypass; client drops it from local state.
    await thunderCore.delete(`/tenants/${id}`)
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
    // The server composes this in one call — quota, device counts, members and logs are
    // joined there rather than fanned out across seam functions like the bypass branch does.
    const res = await thunderCore.get<ThunderResponse<TenantDashboard>>(`/tenants/${tenantId}/dashboard`)
    return res.data.data
}
