import { isDevBypass } from './dev'
import { thunderCore } from './thunder-core'
import {
    ApplicationWorkspace,
    TenantApplicationWorkspace,
    TenantApplicationWorkspaces,
    WorkspaceImportItem,
} from '@/types'

// Workspaces an application offers and which ones each tenant may open (super admin only).
// Contract: Thunder_Core docs/api/application-workspaces.md. Thunder One reads the result from
// /session enabled_workspaces.
type ThunderResponse<T> = { success: boolean; data: T }

export async function getApplicationWorkspaces(appId: string): Promise<ApplicationWorkspace[]> {
    if (isDevBypass()) return MOCK_CATALOG.get(appId) ?? []
    const res = await thunderCore.get<ThunderResponse<ApplicationWorkspace[]>>(`/applications/${appId}/workspaces`)
    return res.data.data
}

/** Upsert on code: an existing workspace is renamed, its status and tenant switches are kept. Returns the whole catalog. */
export async function importApplicationWorkspaces(appId: string, workspaces: WorkspaceImportItem[]): Promise<ApplicationWorkspace[]> {
    if (isDevBypass()) {
        const catalog = MOCK_CATALOG.get(appId) ?? []
        const now = new Date().toISOString()
        for (const w of workspaces) {
            const existing = catalog.find((c) => c.code === w.code)
            if (existing) Object.assign(existing, { name: w.name, updated_at: now })
            else catalog.push({ id: crypto.randomUUID(), application_id: appId, code: w.code, name: w.name, description: w.description ?? null, sort_order: w.sort_order ?? 0, status: 'active', created_at: now, updated_at: now })
        }
        MOCK_CATALOG.set(appId, catalog)
        return catalog
    }
    const res = await thunderCore.post<ThunderResponse<ApplicationWorkspace[]>>(`/applications/${appId}/workspaces`, { workspaces })
    return res.data.data
}

export async function updateApplicationWorkspace(
    appId: string,
    workspaceId: string,
    data: Partial<Pick<ApplicationWorkspace, 'name' | 'description' | 'sort_order' | 'status'>>
): Promise<ApplicationWorkspace> {
    if (isDevBypass()) {
        const row = (MOCK_CATALOG.get(appId) ?? []).find((w) => w.id === workspaceId)
        if (!row) throw new Error('Workspace not found')
        return Object.assign(row, data, { updated_at: new Date().toISOString() })
    }
    const res = await thunderCore.patch<ThunderResponse<ApplicationWorkspace>>(`/applications/${appId}/workspaces/${workspaceId}`, data)
    return res.data.data
}

export async function deleteApplicationWorkspace(appId: string, workspaceId: string): Promise<void> {
    if (isDevBypass()) {
        MOCK_CATALOG.set(appId, (MOCK_CATALOG.get(appId) ?? []).filter((w) => w.id !== workspaceId))
        return
    }
    await thunderCore.delete(`/applications/${appId}/workspaces/${workspaceId}`)
}

export async function getTenantApplicationWorkspaces(tenantId: string, appId: string): Promise<TenantApplicationWorkspaces> {
    if (isDevBypass()) {
        return {
            tenant_id: tenantId,
            application_id: appId,
            access: 'granted',
            workspaces: (MOCK_CATALOG.get(appId) ?? []).map((w) => mockTenantView(tenantId, w)),
        }
    }
    const res = await thunderCore.get<ThunderResponse<TenantApplicationWorkspaces>>(`/tenants/${tenantId}/applications/${appId}/workspaces`)
    return res.data.data
}

export async function setTenantApplicationWorkspace(
    tenantId: string,
    appId: string,
    workspaceId: string,
    isActive: boolean
): Promise<TenantApplicationWorkspace> {
    if (isDevBypass()) {
        const row = (MOCK_CATALOG.get(appId) ?? []).find((w) => w.id === workspaceId)
        if (!row) throw new Error('Workspace not found')
        MOCK_SWITCHES.set(`${tenantId}:${workspaceId}`, isActive)
        return mockTenantView(tenantId, row)
    }
    const res = await thunderCore.put<ThunderResponse<TenantApplicationWorkspace>>(
        `/tenants/${tenantId}/applications/${appId}/workspaces/${workspaceId}`,
        { is_active: isActive }
    )
    return res.data.data
}

// ponytail: in-memory catalog/switches so bypass mode survives a reload; dies with the server process.
const MOCK_CATALOG = new Map<string, ApplicationWorkspace[]>()
const MOCK_SWITCHES = new Map<string, boolean>()

function mockTenantView(tenantId: string, w: ApplicationWorkspace): TenantApplicationWorkspace {
    const isActive = MOCK_SWITCHES.get(`${tenantId}:${w.id}`) ?? false
    return { ...w, is_active: isActive, enabled: isActive && w.status === 'active', switched_at: null }
}
