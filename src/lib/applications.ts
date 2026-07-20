import { ApplicationDetails, ScenarioLevel, ScenarioMetadata, SystemApplication, UpdateApplicationDTO } from '@/models/Application'
import { isDevBypass } from './dev'
import { MOCK_APPLICATIONS } from './mock/applications'
import { MOCK_MEMBERS } from './mock/members'
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

export async function createApplication(name: string, tenantId: string | null): Promise<SystemApplication> {
    if (!isDevBypass()) return noEndpoint('createApplication')
    const now = new Date().toISOString()
    const newApp: SystemApplication = {
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
    MOCK_APPLICATIONS.push(newApp)
    return newApp
}

export async function deleteApplication(id: string): Promise<void> {
    if (!isDevBypass()) noEndpoint('deleteApplication')
    const index = MOCK_APPLICATIONS.findIndex((a) => a.id === id)
    if (index !== -1) MOCK_APPLICATIONS.splice(index, 1)
}

/** A tenant authorized to use an application, with its optional access window. */
export interface ApplicationTenantAccess {
    id: string
    name: string
    starts_at: string | null
    ends_at: string | null
}

export async function getApplicationById(id: string): Promise<ApplicationDetails | null> {
    if (!isDevBypass()) return noEndpoint('getApplicationById')
    const app = MOCK_APPLICATIONS.find((a) => a.id === id)
    if (!app) return null
    // Portal fields persist on the mock app once saved (Object.assign in updateApplication).
    const saved = app as ApplicationDetails
    return {
        ...app,
        custom_domain: saved.custom_domain ?? null,
        branding_color: saved.branding_color ?? '#0F53FF',
        logo_url: saved.logo_url ?? null,
        portal_title: saved.portal_title ?? app.name,
        portal_description: saved.portal_description ?? app.description ?? null,
    }
}

/** Fields the update endpoint accepts — general app fields plus portal customization. */
export type UpdateApplicationInput = UpdateApplicationDTO & {
    logo_url?: string | null
    custom_domain?: string | null
    branding_color?: string
    portal_title?: string | null
    portal_description?: string | null
}

export async function updateApplication(id: string, data: UpdateApplicationInput): Promise<void> {
    if (!isDevBypass()) noEndpoint('updateApplication')
    const app = MOCK_APPLICATIONS.find((a) => a.id === id)
    if (app) Object.assign(app, data, { updated_at: new Date().toISOString() })
}

export async function getApplicationTenants(appId: string): Promise<ApplicationTenantAccess[]> {
    if (!isDevBypass()) return noEndpoint('getApplicationTenants')
    return MOCK_APP_TENANTS.get(appId) ?? []
}

export async function addApplicationAuthorization(
    appId: string,
    tenantId: string,
    startsAt?: string,
    endsAt?: string
): Promise<void> {
    if (!isDevBypass()) noEndpoint('addApplicationAuthorization')
    const tenant = MOCK_TENANTS.find((t) => t.id === tenantId)
    if (!tenant) throw new Error('Tenant not found')
    const current = MOCK_APP_TENANTS.get(appId) ?? []
    if (current.some((t) => t.id === tenantId)) throw new Error('Tenant already has access')
    MOCK_APP_TENANTS.set(appId, [
        ...current,
        { id: tenant.id, name: tenant.name, starts_at: startsAt ?? null, ends_at: endsAt ?? null },
    ])
}

export async function removeApplicationAuthorization(appId: string, tenantId: string): Promise<void> {
    if (!isDevBypass()) noEndpoint('removeApplicationAuthorization')
    MOCK_APP_TENANTS.set(appId, (MOCK_APP_TENANTS.get(appId) ?? []).filter((t) => t.id !== tenantId))
}

// ponytail: in-memory authorizations so add/remove survive a reload in bypass; dies with the server process.
const MOCK_APP_TENANTS = new Map<string, ApplicationTenantAccess[]>(
    MOCK_APPLICATIONS.filter((a) => a.tenant_id).map((a) => [
        a.id,
        [{ id: a.tenant_id, name: a.tenant_name ?? a.tenant_id, starts_at: null, ends_at: null }],
    ])
)

/** A user with access to an application, flattened across its authorized tenants. */
export interface AppMember {
    id: string
    name: string
    email: string
    role: 'Admin' | 'Developer' | 'Viewer'
    status: 'Active' | 'Pending'
    tenantName?: string
}

export async function getApplicationMembers(appId: string): Promise<AppMember[]> {
    if (!isDevBypass()) return noEndpoint('getApplicationMembers')
    // members = everyone in the app's owner tenant + its authorized tenants
    const app = MOCK_APPLICATIONS.find((a) => a.id === appId)
    const tenantIds = new Set<string>([
        ...(app?.tenant_id ? [app.tenant_id] : []),
        ...(MOCK_APP_TENANTS.get(appId) ?? []).map((t) => t.id),
    ])
    const roleLabel = (r: string): AppMember['role'] =>
        r === 'owner' ? 'Admin' : r === 'admin' ? 'Developer' : 'Viewer'
    return MOCK_MEMBERS
        .filter((m) => tenantIds.has(m.tenant_id))
        .map((m) => ({
            id: m.id,
            name: m.user?.full_name ?? 'Unknown User',
            email: m.user?.email ?? 'No email',
            role: roleLabel(m.role),
            status: 'Active' as const,
            tenantName: MOCK_TENANTS.find((t) => t.id === m.tenant_id)?.name,
        }))
}

interface ScenarioState {
    scenario_level: ScenarioLevel
    scenario_metadata: ScenarioMetadata
    scenario_updated_at: string | null
}

// ponytail: in-memory scenario state per app in bypass; dies with the server process.
const MOCK_SCENARIOS = new Map<string, ScenarioState>()

export async function getApplicationScenario(appId: string): Promise<ScenarioState> {
    if (!isDevBypass()) return noEndpoint('getApplicationScenario')
    return MOCK_SCENARIOS.get(appId) ?? { scenario_level: 'normal', scenario_metadata: {}, scenario_updated_at: null }
}

export async function updateApplicationScenario(
    appId: string,
    level: ScenarioLevel,
    metadata?: ScenarioMetadata
): Promise<{ scenario_level: ScenarioLevel; scenario_updated_at: string }> {
    // ponytail: no super_admin gate — add when RBAC lands in the seam.
    if (!isDevBypass()) return noEndpoint('updateApplicationScenario')
    const validLevels: ScenarioLevel[] = ['normal', 'watch', 'crisis', 'lockdown']
    if (!validLevels.includes(level)) throw new Error(`Invalid scenario level: ${level}`)
    const now = new Date().toISOString()
    MOCK_SCENARIOS.set(appId, { scenario_level: level, scenario_metadata: metadata ?? {}, scenario_updated_at: now })
    return { scenario_level: level, scenario_updated_at: now }
}

export async function getApiKey(appId: string): Promise<{ api_key: string | null; api_key_generated_at: string | null }> {
    if (!isDevBypass()) return noEndpoint('getApiKey')
    return MOCK_API_KEYS.get(appId) ?? { api_key: null, api_key_generated_at: null }
}

// ponytail: no super_admin gate here yet — reference enforces it via Supabase role;
// add a server-side RBAC check when the seam grows a role/session context.
export async function regenerateApiKey(appId: string): Promise<{ api_key: string; api_key_generated_at: string }> {
    if (!isDevBypass()) return noEndpoint('regenerateApiKey')
    const record = { api_key: `tk_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`, api_key_generated_at: new Date().toISOString() }
    MOCK_API_KEYS.set(appId, record)
    return record
}

// ponytail: in-memory keys so reveal/regenerate survive a reload in bypass; dies with the server process.
const MOCK_API_KEYS = new Map<string, { api_key: string; api_key_generated_at: string }>()
