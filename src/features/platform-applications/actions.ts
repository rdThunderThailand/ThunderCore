'use server'

import * as applications from '@/lib/applications'
import { ScenarioLevel, ScenarioMetadata } from '@/models/Application'

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

export async function getApplicationById(id: string) {
    return applications.getApplicationById(id)
}

export async function updateApplication(id: string, data: applications.UpdateApplicationInput) {
    return applications.updateApplication(id, data)
}

export async function getApplicationTenants(appId: string) {
    return applications.getApplicationTenants(appId)
}

export async function addApplicationAuthorization(
    appId: string,
    tenantId: string,
    startsAt?: string,
    endsAt?: string
) {
    return applications.addApplicationAuthorization(appId, tenantId, startsAt, endsAt)
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

export async function getApplicationScenario(appId: string) {
    return applications.getApplicationScenario(appId)
}

export async function updateApplicationScenario(
    appId: string,
    level: ScenarioLevel,
    metadata?: ScenarioMetadata
) {
    return applications.updateApplicationScenario(appId, level, metadata)
}
