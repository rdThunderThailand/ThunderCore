import { Application } from '@/types/applications'
import { isDevBypass } from './dev'
import { MOCK_APPLICATIONS } from './mock/applications'
import { MOCK_MEMBER_APPLICATIONS } from './mock/member-applications'

// Living endpoint catalog for the member-scoped applications surface — each signature is the
// future REST contract. Swap bodies to axios (core/v1/tenants/:id/members/:id/applications)
// when the endpoints land; callers don't change.

const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

export async function getMemberApplications(tenantId: string, memberId: string): Promise<Application[]> {
    if (isDevBypass()) {
        const appIds = MOCK_MEMBER_APPLICATIONS
            .filter((link) => link.member_id === memberId)
            .map((link) => link.application_id)

        return MOCK_APPLICATIONS.filter((app) => app.tenant_id === tenantId && appIds.includes(app.id))
    }
    return noEndpoint('getMemberApplications')
}

export async function assignApplicationToMember(_tenantId: string, _memberId: string, applicationId: string): Promise<Application> {
    if (!isDevBypass()) return noEndpoint('assignApplicationToMember')
    // ponytail: echo the app so the client can append it locally; not persisted in bypass mode.
    const app = MOCK_APPLICATIONS.find((a) => a.id === applicationId)
    if (!app) throw new Error('assignApplicationToMember: application not found')
    return app
}

export async function removeApplicationFromMember(_tenantId: string, _memberId: string, _applicationId: string): Promise<void> {
    if (!isDevBypass()) noEndpoint('removeApplicationFromMember')
    // ponytail: no-op in bypass; client drops it from local state.
}
