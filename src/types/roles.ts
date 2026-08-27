// A role row as the backend actually models it — GET /tenants/:id/roles. Distinct from the
// legacy TenantRole label union in types/members.ts: role_type is the tier RBAC keys on, code
// is the actual value sent back to the API, and a tenant can have several roles sharing one
// role_type (e.g. multiple operator personas) with no generic code between them.
export interface TenantRoleDefinition {
    id: string
    code: string
    name: string
    role_type: string
    role_scope: string
    description: string | null
    is_system: boolean
}
