import { Application } from '@/types/applications'
import { isDevBypass } from './dev'
import { MOCK_APPLICATIONS } from './mock/applications'
import { MOCK_APPLICATION_MEMBERS } from './mock/application-members'
import { isAxiosError, thunderCore } from './thunder-core'
import { TenantApplicationView } from '@/types/tenant-applications'

// Living endpoint catalog for the tenant-scoped applications surface — each signature is the
// future REST contract. Swap bodies to axios (core/v1/tenants/:id/applications) when the
// endpoints land; callers don't change.
type ThunderResponse<T> = { success: boolean; data: T }

const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

export async function getTenantApplications(tenantId: string): Promise<TenantApplicationView[]> {
    if (isDevBypass()) {
        return MOCK_APPLICATIONS
            .filter((a) => a.tenant_id === tenantId)
            .map((a): TenantApplicationView => ({
                id: a.id,
                name: a.name,
                description: a.description ?? null,
                status: a.status ?? 'active',
                environment: a.environment ?? 'production',
                url: a.url ?? null,
                logo_url: a.logo_url ?? null,
                created_at: a.created_at.toISOString(),
                updated_at: a.updated_at?.toISOString() ?? null,
                relation: 'owned',
                access: null,
            }))
    }
    const res = await thunderCore.get<ThunderResponse<{ applications: TenantApplicationView[] }>>(`/tenants/${tenantId}/applications`)
    return res.data.data.applications ?? []
}

type CreateApplicationInput = {
    tenantId: string
    name: string
    description?: string
    environment: 'production' | 'staging' | 'development'
    url?: string
}

export async function createTenantApplication(data: CreateApplicationInput): Promise<Application> {
    if (isDevBypass()) {
        const now = new Date()
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
    const { tenantId, url, ...payload } = data
    try {
        const res = await thunderCore.post<ThunderResponse<Application>>(`/tenants/${tenantId}/applications`, {
            ...payload,
            // Backend schema is z.string().url().nullable().optional() — '' fails .url(), only a real URL or an omitted key pass.
            url: url?.trim() || undefined,
        })
        return res.data.data
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const body = error.response.data as { message?: string; error?: string }
            throw new Error(body.message || body.error || `Failed to create application (${error.response.status})`)
        }
        throw error
    }
}

type UpdateApplicationInput = {
    name?: string
    description?: string
    status?: 'active' | 'inactive' | 'maintenance'
    environment?: 'production' | 'staging' | 'development'
    url?: string
    logo_url?: string | null
}

export async function updateTenantApplication(tenantId: string, applicationId: string, data: UpdateApplicationInput): Promise<Application> {
    if (isDevBypass()) {
        const base = MOCK_APPLICATIONS.find((a) => a.id === applicationId) ?? MOCK_APPLICATIONS[0]
        return { ...base, ...data, id: applicationId, updated_at: new Date() }
    }
    const { url, logo_url, ...payload } = data
    try {
        const res = await thunderCore.patch<ThunderResponse<Application>>(`/tenants/${tenantId}/applications/${applicationId}`, {
            ...payload,
            // Same '' vs .url() problem as create — only send url if it's non-empty.
            ...(url !== undefined ? { url: url.trim() || undefined } : {}),
            ...(logo_url !== undefined ? { logo_url: logo_url?.trim() || null } : {}),
        })
        return res.data.data
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const body = error.response.data as { message?: string; error?: string }
            throw new Error(body.message || body.error || `Failed to update application (${error.response.status})`)
        }
        throw error
    }
}

export async function deleteTenantApplication(tenantId: string, applicationId: string): Promise<void> {
    if (isDevBypass()) {
        return
    }
    await thunderCore.delete<ThunderResponse<void>>(`/tenants/${tenantId}/applications/${applicationId}`)
}



const appRoleToBackend = (role: 'Owner' | 'Admin' | 'Developer' | 'Viewer'): string =>
    role === 'Owner' ? 'owner' : role === 'Admin' ? 'admin' : role === 'Developer' ? 'developer' : 'viewer'

// memberId here is memberships.id (tenant membership), not a member_app_access row id —
// this grants an existing tenant member access to the app, it doesn't invite by email.
export async function inviteMember(
    tenantId: string,
    applicationId: string,
    memberId: string,
    role: 'Owner' | 'Admin' | 'Developer' | 'Viewer'
): Promise<{ id: string, application_id: string }> {
    const backendRole = appRoleToBackend(role)
    if (isDevBypass()) {
        const existing = MOCK_APPLICATION_MEMBERS.find(
            (access) => access.membership_id === memberId && access.application_id === applicationId
        )
        if (existing) {
            existing.is_active = true
            existing.role = backendRole
        } else {
            MOCK_APPLICATION_MEMBERS.push({
                id: crypto.randomUUID(),
                membership_id: memberId,
                application_id: applicationId,
                role: backendRole,
                is_active: true,
                created_at: new Date().toISOString(),
            })
        }
        return { id: memberId, application_id: applicationId }
    }
    const res = await thunderCore.post<ThunderResponse<{ id: string, application_id: string }>>(
        `/tenants/${tenantId}/applications/${applicationId}/members/${memberId}`,
        { role: backendRole }
    )
    return res.data.data
}


// memberId here is memberships.id, same as inviteMember's — the backend's DELETE handler does
// requireMembership(...) + .eq('membership_id', memberId), NOT a member_app_access row id.
export async function revokeMemberAppAccess(tenantId: string, applicationId: string, memberId: string): Promise<void> {
    if (isDevBypass()) {
        const existing = MOCK_APPLICATION_MEMBERS.find(
            (access) => access.membership_id === memberId && access.application_id === applicationId
        )
        if (existing) existing.is_active = false
        return
    }
    await thunderCore.delete<ThunderResponse<void>>(`/tenants/${tenantId}/applications/${applicationId}/members/${memberId}`)
}



export async function launchTenantApplication(tenantId: string, applicationId: string): Promise<string> {
    if (isDevBypass()) {
        const app = MOCK_APPLICATIONS.find((a) => a.id === applicationId && a.tenant_id === tenantId)
        return app?.url ?? '#'
    }
    return noEndpoint('launchTenantApplication')
}
