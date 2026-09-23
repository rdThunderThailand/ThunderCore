import { TenantRoleDefinition } from '@/types/roles'
import { isDevBypass } from './dev'
import { thunderCore } from './thunder-core'

type ThunderResponse<T> = { success: boolean; data: T }

const MOCK_TENANT_ROLES: TenantRoleDefinition[] = [
    { id: 'mock-admin_company', code: 'admin_company', name: 'Tenant Administrator', role_type: 'company_admin', role_scope: 'tenant', description: null, is_system: true },
    { id: 'mock-department_admin', code: 'department_admin', name: 'Department Admin', role_type: 'department_admin', role_scope: 'tenant', description: null, is_system: false },
    { id: 'mock-operator_technician', code: 'operator_technician', name: 'Technician', role_type: 'operator', role_scope: 'organization', description: null, is_system: false },
]

// GET /tenants/:id/roles — the tenant's actual assignable roles. Was already built on the
// backend but unused by the frontend; the invite modal and the member role-change dropdown had
// been hardcoding a fixed label list that didn't match any real role_code (see mapRoleToBackend's
// removal — 'operator' isn't a real code, operator-tier roles are tenant-specific personas).
export async function getTenantRoles(tenantId: string): Promise<TenantRoleDefinition[]> {
    if (isDevBypass()) {
        return MOCK_TENANT_ROLES
    }

    const res = await thunderCore.get<ThunderResponse<TenantRoleDefinition[]>>(`/tenants/${tenantId}/roles`)
    // super_admin is platform-scope — never a role a tenant invite/role-change should offer.
    return res.data.data.filter((r) => r.role_type !== 'super_admin')
}
