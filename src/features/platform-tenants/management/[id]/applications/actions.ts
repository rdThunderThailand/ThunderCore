'use server'

import * as tenantApplications from '@/lib/tenant-applications'

// Server Action boundary for the tenant-scoped applications surface — delegates to the src/lib seam.

export async function getTenantApplications(tenantId: string) {
    return tenantApplications.getTenantApplications(tenantId)
}

export async function createApplication(data: {
    tenantId: string
    name: string
    description?: string
    environment: 'production' | 'staging' | 'development'
    url?: string
}) {
    return tenantApplications.createTenantApplication(data)
}

export async function updateApplication(tenantId: string, applicationId: string, data: {
    name?: string
    description?: string
    status?: 'active' | 'inactive' | 'maintenance'
    environment?: 'production' | 'staging' | 'development'
    url?: string
    logo_url?: string | null
}) {
    return tenantApplications.updateTenantApplication(tenantId, applicationId, data)
}

export async function deleteApplication(applicationId: string, tenantId: string) {
    return tenantApplications.deleteTenantApplication(tenantId, applicationId)
}

export async function revokeMemberAppAccess(
    tenantId: string,
    applicationId: string,
    accessId: string
) {
    return tenantApplications.revokeMemberAppAccess(tenantId, applicationId, accessId)
}

export async function inviteMember(
    tenantId: string,
    applicationId: string,
    memberId: string,
    role: 'Owner' | 'Admin' | 'Developer' | 'Viewer'
) {
    return tenantApplications.inviteMember(tenantId, applicationId, memberId, role)
}

export async function launchApplication(
    tenantId: string,
    applicationId: string
) {
    return tenantApplications.launchTenantApplication(tenantId, applicationId)
}
