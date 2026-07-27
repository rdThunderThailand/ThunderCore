import { isDevBypass } from './dev'
import { MOCK_APPLICATIONS } from './mock/applications'
import { MOCK_APPLICATION_MEMBERS } from './mock/application-members'
import { MOCK_MEMBERS } from './mock/members'
import { MOCK_TENANTS } from './mock/tenants'
import { thunderCore } from './thunder-core'
import { ApplicationTenantAccess, Application, ApplicationTenantsAccess, Tenant, UpdateApplicationDTO, AppMember } from '@/types'

// Living endpoint catalog — each signature is the future REST contract.
// Swap bodies to axios (core/v1/applications) when the endpoints land; callers don't change.
type ThunderResponse<T> = { success: boolean; data: T }

const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

export async function getAllApplications(): Promise<Application[]> {
    if (isDevBypass()) return MOCK_APPLICATIONS
    const res = await thunderCore.get<ThunderResponse<Application[]>>('/applications')
    return res.data.data
}

/** Owner picker for the create modal. */
export async function getTenantsForSelect(): Promise<Array<{ id: string; name: string }>> {
    if (isDevBypass()) return MOCK_TENANTS.map(({ id, name }) => ({ id, name }))
    const res = await thunderCore.get<ThunderResponse<Tenant[]>>('/tenants')
    return res.data.data.map((t) => ({ id: t.id, name: t.name }))
}


export type CreateApplicationDTO = {
    name: string
    tenant_id?: string | null
    description?: string | null
    url?: string | null
}


export async function createApplication(data: CreateApplicationDTO): Promise<Application> {

    if (isDevBypass()) {
        const now = new Date()
        const newApp: Application = {
            id: crypto.randomUUID(),
            name: data.name,
            tenant_id: data.tenant_id ?? '',
            status: 'active',
            environment: 'production',
            created_at: now,
            updated_at: now,
        }
        MOCK_APPLICATIONS.push(newApp)
        return newApp
    }

    const res = await thunderCore.post<ThunderResponse<Application>>('/applications', data)
    return res.data.data
}

export async function deleteApplication(id: string): Promise<void> {
    if (isDevBypass()) {
        const index = MOCK_APPLICATIONS.findIndex((a) => a.id === id)
        if (index !== -1) MOCK_APPLICATIONS.splice(index, 1)
        return
    }
    await thunderCore.delete(`/applications/${id}`)
}


export async function getApplicationById(id: string): Promise<Application | null> {
    if (isDevBypass()) {
        const app = MOCK_APPLICATIONS.find((a) => a.id === id)
        if (!app) return null
        // Portal fields persist on the mock app once saved (Object.assign in updateApplication).
        const saved = app as Application
        return {
            ...app,
            custom_domain: saved.custom_domain ?? null,
            branding_color: saved.branding_color ?? '#0F53FF',
            logo_url: saved.logo_url ?? null,
            portal_title: saved.portal_title ?? app.name,
            portal_description: saved.portal_description ?? app.description ?? null,
        }
    }
    const res = await thunderCore.get<ThunderResponse<Application>>(`/applications/${id}`)
    return res.data.data
}



export async function updateApplication(id: string, data: UpdateApplicationDTO): Promise<Application | undefined> {
    if (isDevBypass()) {
        const app = MOCK_APPLICATIONS.find((a) => a.id === id)
        if (app) Object.assign(app, data, { updated_at: new Date().toISOString() })
        return app
    }
    const res = await thunderCore.patch<ThunderResponse<Application>>(`/applications/${id}`, data)
    return res.data.data
}





export async function getApplicationTenants(appId: string): Promise<ApplicationTenantsAccess[]> {
    if (isDevBypass()) return MOCK_APP_TENANTS.get(appId) ?? []
    const res = await thunderCore.get<ThunderResponse<ApplicationTenantsAccess[]>>(`/applications/${appId}/tenants`)
    return res.data.data
}



export async function addApplicationAuthorization(data: ApplicationTenantAccess): Promise<ApplicationTenantAccess> {
    if (isDevBypass()) {
        const tenant = MOCK_TENANTS.find((t) => t.id === data.tenantId)
        if (!tenant) throw new Error('Tenant not found')
        const current = MOCK_APP_TENANTS.get(data.appId) ?? []
        if (current.some((t) => t.tenant_id === data.tenantId)) throw new Error('Tenant already has access')
        const startsAt = data.startsAt ?? new Date().toISOString()
        MOCK_APP_TENANTS.set(data.appId, [
            ...current,
            {
                id: crypto.randomUUID(),
                tenant_id: tenant.id,
                tenant_name: tenant.name,
                role: 'member',
                status: 'active',
                started_at: startsAt,
                created_at: new Date().toISOString(),
                ended_at: data.endsAt ?? null,
            },
        ])
        return { appId: data.appId, tenantId: tenant.id, startsAt, endsAt: data.endsAt }
    }

    // Backend's assignTenantSchema accepts tenant_id and started_at (defaults to now if omitted).
    // ended_at isn't stored on insert yet, so it's not sent — would 400 against the strict schema.
    const res = await thunderCore.post<ThunderResponse<ApplicationTenantAccess>>(`/applications/${data.appId}/tenants`, {
        tenant_id: data.tenantId,
        started_at: data.startsAt,
    })
    return res.data.data
}

export async function removeApplicationAuthorization(appId: string, tenantId: string): Promise<void> {
    if (isDevBypass()) {
        MOCK_APP_TENANTS.set(appId, (MOCK_APP_TENANTS.get(appId) ?? []).filter((t) => t.tenant_id !== tenantId))
        return
    }

    await thunderCore.delete(`/applications/${appId}/tenants/${tenantId}`)
}

// ponytail: in-memory authorizations so add/remove survive a reload in bypass; dies with the server process.
const MOCK_APP_TENANTS = new Map<string, ApplicationTenantsAccess[]>(
    MOCK_APPLICATIONS.filter((a) => a.tenant_id).map((a) => [
        a.id,
        [{
            id: crypto.randomUUID(),
            tenant_id: a.tenant_id as string,
            tenant_name: MOCK_TENANTS.find((t) => t.id === a.tenant_id)?.name ?? (a.tenant_id as string),
            role: 'owner',
            status: 'active',
            started_at: a.created_at.toISOString(),
            created_at: a.created_at.toISOString(),
            ended_at: null,
        }],
    ])
)



const appAccessRoleLabel = (r: string): AppMember['role'] =>
    r === 'owner' ? 'Admin' : r === 'admin' ? 'Developer' : 'Viewer'

// Raw row shape returned by GET /applications/:id/members — not AppMember-shaped,
// must be mapped (full_name -> name, is_active -> status, tenant_name -> tenantName, ...).
type BackendMemberRow = {
    id: string
    membership_id: string
    full_name: string
    email: string
    role: string
    is_active: boolean
    tenant_name: string | null
}

export async function getApplicationMembers(appId: string): Promise<AppMember[]> {
    if (isDevBypass()) {
        return MOCK_APPLICATION_MEMBERS
            .filter((access) => access.application_id === appId)
            .map((access) => {
                const membership = MOCK_MEMBERS.find((m) => m.id === access.membership_id)
                return {
                    id: access.id,
                    membershipId: access.membership_id,
                    name: membership?.user?.full_name ?? 'Unknown User',
                    email: membership?.user?.email ?? 'No email',
                    role: appAccessRoleLabel(access.role),
                    status: access.is_active ? 'Active' as const : 'Pending' as const,
                    tenantName: MOCK_TENANTS.find((t) => t.id === membership?.tenant_id)?.name,
                }
            })
    }

    const res = await thunderCore.get<ThunderResponse<BackendMemberRow[]>>(`/applications/${appId}/members`)
    return res.data.data.map((row) => ({
        id: row.id,
        membershipId: row.membership_id,
        name: row.full_name || 'Unknown User',
        email: row.email || 'No email',
        role: appAccessRoleLabel(row.role),
        status: row.is_active ? 'Active' as const : 'Pending' as const,
        tenantName: row.tenant_name ?? undefined,
    }))
}

// interface ScenarioState {
//     scenario_level: ScenarioLevel
//     scenario_metadata: ScenarioMetadata
//     scenario_updated_at: string | null
// }

// // ponytail: in-memory scenario state per app in bypass; dies with the server process.
// const MOCK_SCENARIOS = new Map<string, ScenarioState>()

// export async function getApplicationScenario(appId: string): Promise<ScenarioState> {
//     if (!isDevBypass()) return noEndpoint('getApplicationScenario')
//     return MOCK_SCENARIOS.get(appId) ?? { scenario_level: 'normal', scenario_metadata: {}, scenario_updated_at: null }
// }

// export async function updateApplicationScenario(
//     appId: string,
//     level: ScenarioLevel,
//     metadata?: ScenarioMetadata
// ): Promise<{ scenario_level: ScenarioLevel; scenario_updated_at: string }> {
//     // ponytail: no super_admin gate — add when RBAC lands in the seam.
//     if (!isDevBypass()) return noEndpoint('updateApplicationScenario')
//     const validLevels: ScenarioLevel[] = ['normal', 'watch', 'crisis', 'lockdown']
//     if (!validLevels.includes(level)) throw new Error(`Invalid scenario level: ${level}`)
//     const now = new Date().toISOString()
//     MOCK_SCENARIOS.set(appId, { scenario_level: level, scenario_metadata: metadata ?? {}, scenario_updated_at: now })
//     return { scenario_level: level, scenario_updated_at: now }
// }

export async function getApiKey(appId: string): Promise<{ api_key: string | null; api_key_generated_at: string | null }> {
    if (isDevBypass()) {
        return MOCK_API_KEYS.get(appId) ?? { api_key: null, api_key_generated_at: null }
    }
    const res = await thunderCore.get<ThunderResponse<{ api_key: string | null; api_key_generated_at: string | null }>>(`/applications/${appId}/api-key`)
    return res.data.data
}

// ponytail: no super_admin gate here yet — reference enforces it via Supabase role;
// add a server-side RBAC check when the seam grows a role/session context.
export async function regenerateApiKey(appId: string): Promise<{ api_key: string; api_key_generated_at: string }> {
    if (isDevBypass()) {
        const record = { api_key: `tk_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`, api_key_generated_at: new Date().toISOString() }
        MOCK_API_KEYS.set(appId, record)
        return record
    }
    const res = await thunderCore.post<ThunderResponse<{ api_key: string; api_key_generated_at: string }>>(`/applications/${appId}/api-key/regenerate`)
    return res.data.data
}

// ponytail: in-memory keys so reveal/regenerate survive a reload in bypass; dies with the server process.
const MOCK_API_KEYS = new Map<string, { api_key: string; api_key_generated_at: string }>()
