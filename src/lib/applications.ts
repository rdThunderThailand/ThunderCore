import { SystemApplication } from '@/models/Application'
import { isDevBypass } from './dev'
import { MOCK_APPLICATIONS } from './mock/applications'
import { MOCK_TENANTS } from './mock/tenants'

// Living endpoint catalog — each signature is the future REST contract.
// Swap bodies to axios (core/v1/applications) when the endpoints land; callers don't change.

const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

export async function getAllApplications(): Promise<SystemApplication[]> {
    if (isDevBypass()) return MOCK_APPLICATIONS
    return noEndpoint('getAllApplications')
}

/** Owner picker for the create modal. */
export async function getTenantsForSelect(): Promise<Array<{ id: string; name: string }>> {
    if (isDevBypass()) return MOCK_TENANTS.map(({ id, name }) => ({ id, name }))
    return noEndpoint('getTenantsForSelect')
}

/** tenantId set → tenant-owned app; null → shared system app. */
export async function createApplication(name: string, tenantId: string | null): Promise<SystemApplication> {
    if (!isDevBypass()) return noEndpoint('createApplication')
    const now = new Date().toISOString()
    return {
        id: crypto.randomUUID(),
        name,
        tenant_id: tenantId ?? '',
        tenant_name: MOCK_TENANTS.find((t) => t.id === tenantId)?.name,
        status: 'active',
        environment: 'production',
        is_shared: tenantId === null,
        created_at: now,
        updated_at: now,
    }
}

export async function deleteApplication(_id: string): Promise<void> {
    if (!isDevBypass()) noEndpoint('deleteApplication')
    // ponytail: no-op in bypass; client drops it from local state.
}
