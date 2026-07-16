'use server'

import { ApplicationService } from '@/lib/core/ApplicationService'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get all applications for an tenant
 * Shows OWNED applications (created with this org) AND INVITED applications (shared to this org)
 */
export async function getTenantApplications(tenantId: string) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)
    return service.getTenantApplications(tenantId)
}

/**
 * Create a new application
 */
export async function createApplication(data: {
    tenantId: string
    name: string
    description?: string
    environment: 'production' | 'staging' | 'development'
    url?: string
}) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)

    const application = await service.createApplication(data)

    // Keep notification logic here or move to service (optional, keeping here for now as it's UI feedback)
// [createNotification removed]

    revalidatePath(`/dashboard/tenants/management/${data.tenantId}/applications`)
    return application
}

/**
 * Update an application
 */
export async function updateApplication(applicationId: string, data: {
    name?: string
    description?: string
    status?: 'active' | 'inactive' | 'maintenance'
    environment?: 'production' | 'staging' | 'development'
    url?: string
}) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)

    // The service handles permission checks
    const application = await service.updateApplication(applicationId, data)

    revalidatePath(`/dashboard/tenants/management/${application.tenant_id}/applications`)
    return application
}

/**
 * Delete an application
 */
export async function deleteApplication(applicationId: string, tenantId: string) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)

    await service.deleteApplication(applicationId, tenantId)

    // Notification
// [createNotification removed]

    revalidatePath(`/dashboard/tenants/management/${tenantId}/applications`)
    return { success: true }
}

/**
 * Get members with access to a specific application within an tenant
 */
export async function getMemberAppAccess(tenantId: string, applicationId: string) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)
    return service.getMemberAppAccess(tenantId, applicationId)
}

/**
 * Grant a member access to an application
 */
export async function grantMemberAppAccess(
    tenantId: string,
    applicationId: string,
    memberId: string
) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)

    await service.grantMemberAppAccess(tenantId, applicationId, memberId)

    revalidatePath(`/dashboard/tenants/management/${tenantId}/applications`)
    return { success: true }
}

/**
 * Revoke a member's access to an application
 */
export async function revokeMemberAppAccess(
    tenantId: string,
    applicationId: string,
    memberId: string
) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)

    await service.revokeMemberAppAccess(tenantId, applicationId, memberId)

    revalidatePath(`/dashboard/tenants/management/${tenantId}/applications`)
    return { success: true }
}

/**
 * Generate a signed launch URL for an application
 */
export async function launchApplication(
    tenantId: string,
    applicationId: string
) {
    const supabase = await createClient()
    const service = new ApplicationService(supabase)
    return service.launchApplication(tenantId, applicationId)
}
