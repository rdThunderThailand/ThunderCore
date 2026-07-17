'use server'

import * as applications from '@/lib/applications'

// Server Action boundary for the applications surface — delegates to the src/lib seam.

export async function getAllApplications() {
    return applications.getAllApplications()
}

export async function getTenantsForSelect() {
    return applications.getTenantsForSelect()
}

export async function createApplication(name: string, tenantId: string | null) {
    return applications.createApplication(name, tenantId)
}

export async function deleteApplication(id: string) {
    return applications.deleteApplication(id)
}
