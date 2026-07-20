'use server'

import { ScenarioLevel, ScenarioMetadata, ApplicationDetails } from '@/models/Application'

export async function getApplicationById(appId: string): Promise<ApplicationDetails> {
    return {
        id: appId,
        name: 'Thunder CityZen',
        tenant_id: 'tenant-1',
        status: 'active',
        environment: 'production',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scenario_level: 'normal',
        scenario_metadata: {},
        scenario_updated_at: new Date().toISOString(),
    }
}

export async function getApplicationScenario(appId: string) {
    return {
        scenario_level: 'normal' as ScenarioLevel,
        scenario_metadata: {} as ScenarioMetadata,
        scenario_updated_at: new Date().toISOString(),
    }
}

export async function updateApplicationScenario(
    appId: string,
    level: ScenarioLevel,
    metadata: ScenarioMetadata
) {
    return {
        scenario_level: level,
        scenario_metadata: metadata,
        scenario_updated_at: new Date().toISOString(),
    }
}
