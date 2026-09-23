'use server'

import * as applications from '@/lib/applications'
import { ApplicationTenantAccess, UpdateApplicationDTO } from '@/types'
// import { ScenarioLevel, ScenarioMetadata } from '@/models/Application'

// Server Action boundary for the applications surface — delegates to the src/lib seam.

export async function getAllApplications() {
    return applications.getAllApplications()
}

export async function getAllTenantsForSelect() {
    return applications.getAllTenantsForSelect()
}

export async function getSubTenantsForSelect(tenantId: string) {
    return applications.getSubTenantsForSelect(tenantId)
}

export async function createApplication(data: applications.CreateApplicationDTO) {
    return applications.createApplication(data)
}

export async function deleteApplication(id: string) {
    return applications.deleteApplication(id)
}

export async function getApplicationById(id: string) {
    return applications.getApplicationById(id)
}

export async function updateApplication(id: string, data: UpdateApplicationDTO) {
    return applications.updateApplication(id, data)
}

export async function getApplicationTenants(appId: string) {
    return applications.getApplicationTenants(appId)
}

export async function addApplicationAuthorization(data: ApplicationTenantAccess) {
    return applications.addApplicationAuthorization(data)
}

export async function removeApplicationAuthorization(appId: string, tenantId: string) {
    return applications.removeApplicationAuthorization(appId, tenantId)
}

export async function getApplicationMembers(appId: string) {
    return applications.getApplicationMembers(appId)
}

export async function getApiKey(appId: string) {
    return applications.getApiKey(appId)
}

export async function regenerateApiKey(appId: string) {
    return applications.regenerateApiKey(appId)
}

// export async function getApplicationScenario(appId: string) {
//     return applications.getApplicationScenario(appId)
// }

// export async function updateApplicationScenario(
//     appId: string,
//     level: ScenarioLevel,
//     metadata?: ScenarioMetadata
// ) {
//     return applications.updateApplicationScenario(appId, level, metadata)
// }
