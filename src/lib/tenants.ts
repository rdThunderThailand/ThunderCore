import { Tenant } from '@/types/tenants'
import { isDevBypass } from './dev'
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
    // ponytail: echo a shaped row so the client can render it; real POST returns the server row.
    // Not persisted across requests in bypass mode — the client holds it in local state.
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

export async function updateTenant(id: string, data: Partial<TenantInput>): Promise<Tenant> {
    if (!isDevBypass()) throw new Error('updateTenant: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    const base = MOCK_TENANTS.find((t) => t.id === id) ?? MOCK_TENANTS[0]
    return { ...base, id, ...data }
}

export async function deleteTenant(_id: string): Promise<void> {
    if (!isDevBypass()) throw new Error('deleteTenant: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client drops it from local state.
}
