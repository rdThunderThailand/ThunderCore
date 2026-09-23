'use server'

import * as tenants from '@/lib/tenants'
import { Tenant } from '@/types/tenants'

// Server Action boundary for the tenants surface — delegates to the src/lib seam.

export async function createTenant(data: { name: string; type: Tenant['type']; status: Tenant['status'] }) {
    return tenants.createTenant(data)
}

export async function updateTenant(id: string, data: Partial<tenants.TenantInput>) {
    return tenants.updateTenant(id, data)
}

export async function deleteTenant(id: string) {
    return tenants.deleteTenant(id)
}
