'use server'

import { revalidatePath } from 'next/cache'
import { isAxiosError } from 'axios'
import * as tenants from '@/lib/tenants'

// Server Action boundary for Child Tenants — delegates to the src/lib seam. Core enforces super admin
// and refuses cycles / missing parents; the message comes back for the UI to show.

export type ChildActionResult = { ok: true } | { ok: false; error: string }

async function setParent(childId: string, parentId: string | null, parentCode: string): Promise<ChildActionResult> {
    try {
        await tenants.updateTenant(childId, { parent_tenant_id: parentId })
        revalidatePath(`/tenants/management/${parentCode}/children`)
        return { ok: true }
    } catch (e) {
        if (isAxiosError(e) || e instanceof Error) return { ok: false, error: e.message || 'Failed to update tenant' }
        throw e
    }
}

export async function attachChildTenant(parentId: string, parentCode: string, childId: string) {
    return setParent(childId, parentId, parentCode)
}

export async function detachChildTenant(parentCode: string, childId: string) {
    return setParent(childId, null, parentCode)
}
