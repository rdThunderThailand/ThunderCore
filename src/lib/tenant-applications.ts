import { Application } from '@/types/applications'
import { isDevBypass } from './dev'
import { MOCK_APPLICATIONS } from './mock/applications'
import { MOCK_MEMBERS } from './mock/members'

// Living endpoint catalog for the tenant-scoped applications surface — each signature is the
// future REST contract. Swap bodies to axios (core/v1/tenants/:id/applications) when the
// endpoints land; callers don't change.

const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

export async function getTenantApplications(tenantId: string): Promise<Application[]> {
    if (isDevBypass()) return MOCK_APPLICATIONS.filter((a) => a.tenant_id === tenantId)
    return noEndpoint('getTenantApplications')
}

type CreateApplicationInput = {
    tenantId: string
    name: string
    description?: string
    environment: 'production' | 'staging' | 'development'
    url?: string
}

export async function createApplication(data: CreateApplicationInput): Promise<Application> {
    if (!isDevBypass()) return noEndpoint('createApplication')
    // ponytail: echo a shaped row so the client can render it; real POST returns the server row.
    // Not persisted across requests in bypass mode — the client holds it in local state.
    const now = new Date().toISOString()
    return {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        tenant_id: data.tenantId,
        status: 'active',
        environment: data.environment,
        url: data.url,
        created_at: now,
        updated_at: now,
    }
}

type UpdateApplicationInput = {
    name?: string
    description?: string
    status?: 'active' | 'inactive' | 'maintenance'
    environment?: 'production' | 'staging' | 'development'
    url?: string
}

export async function updateApplication(applicationId: string, data: UpdateApplicationInput): Promise<Application> {
    if (!isDevBypass()) return noEndpoint('updateApplication')
    const base = MOCK_APPLICATIONS.find((a) => a.id === applicationId) ?? MOCK_APPLICATIONS[0]
    return { ...base, ...data, id: applicationId, updated_at: new Date().toISOString() }
}

export async function deleteApplication(_applicationId: string, _tenantId: string): Promise<void> {
    if (!isDevBypass()) noEndpoint('deleteApplication')
    // ponytail: no-op in bypass; client drops it from local state.
}

export interface MemberAppAccess {
    id: string
    user_id: string
    tenant_id: string
    role: string
    user: { id: string; email: string; full_name: string }
    has_access: boolean
}

export async function getMemberAppAccess(tenantId: string, _applicationId: string): Promise<MemberAppAccess[]> {
    if (isDevBypass()) {
        return MOCK_MEMBERS
            .filter((m) => m.tenant_id === tenantId)
            .map((m, i) => ({
                id: m.id,
                user_id: m.user_id,
                tenant_id: m.tenant_id,
                role: m.role,
                user: {
                    id: m.user?.id ?? m.user_id,
                    email: m.user?.email ?? '',
                    full_name: m.user?.full_name ?? '',
                },
                has_access: i === 0,
            }))
    }
    return noEndpoint('getMemberAppAccess')
}

export async function grantMemberAppAccess(_tenantId: string, _applicationId: string, _memberId: string): Promise<void> {
    if (!isDevBypass()) noEndpoint('grantMemberAppAccess')
    // ponytail: no-op in bypass; client flips has_access in local state.
}

export async function revokeMemberAppAccess(_tenantId: string, _applicationId: string, _memberId: string): Promise<void> {
    if (!isDevBypass()) noEndpoint('revokeMemberAppAccess')
    // ponytail: no-op in bypass; client flips has_access in local state.
}

export async function launchApplication(tenantId: string, applicationId: string): Promise<string> {
    if (isDevBypass()) {
        const app = MOCK_APPLICATIONS.find((a) => a.id === applicationId && a.tenant_id === tenantId)
        return app?.url ?? '#'
    }
    return noEndpoint('launchApplication')
}
