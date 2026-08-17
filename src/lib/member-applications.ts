import { Application } from '@/types/applications'
import { isDevBypass } from './dev'
import { MOCK_APPLICATIONS } from './mock/applications'
import { MOCK_MEMBER_APPLICATIONS } from './mock/member-applications'
import { thunderCore } from './thunder-core'
// Living endpoint catalog for the member-scoped applications surface — each signature is the
// future REST contract. Swap bodies to axios (core/v1/tenants/:id/members/:id/applications)
// when the endpoints land; callers don't change.

const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

type ThunderResponse<T> = { success: boolean; data: T }
export async function getMemberApplications(tenantId: string, memberId: string): Promise<Application[]> {
    if (isDevBypass()) {
        const appIds = MOCK_MEMBER_APPLICATIONS
            .filter((link) => link.member_id === memberId)
            .map((link) => link.application_id)

        return MOCK_APPLICATIONS.filter((app) => app.tenant_id === tenantId && appIds.includes(app.id))
    }
    const res = await thunderCore.get<ThunderResponse<Application[]>>(`/tenants/${tenantId}/members/${memberId}/applications`)
    return res.data.data
    // return noEndpoint('getMemberApplications')
}

export async function assignApplicationToMember(_tenantId: string, _memberId: string, applicationId: string): Promise<Application> {
    if (!isDevBypass()) {
        const app = MOCK_APPLICATIONS.find((a) => a.id === applicationId)
        if (!app) throw new Error('assignApplicationToMember: application not found')
        return app
    }
    const res = await thunderCore.post<ThunderResponse<Application>>(`/tenants/${_tenantId}/members/${_memberId}/applications/${applicationId}`)
    return res.data.data
    // return noEndpoint('assignApplicationToMember')
    // ponytail: echo the app so the client can append it locally; not persisted in bypass mode.
}

export async function removeApplicationFromMember(_tenantId: string, _memberId: string, _applicationId: string): Promise<void> {
    if (!isDevBypass()) {
        return noEndpoint('removeApplicationFromMember')
    }
    const res = await thunderCore.delete<ThunderResponse<void>>(`/tenants/${_tenantId}/members/${_memberId}/applications/${_applicationId}`)
    return res.data.data
    // ponytail: no-op in bypass; client drops it from local state.
}
