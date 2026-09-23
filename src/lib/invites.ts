import { AcceptInviteResult, InviteDetails } from '@/types/invites'
import { isDevBypass } from './dev'
import { isAxiosError, thunderCore } from './thunder-core'

type ThunderResponse<T> = { success: boolean; data: T }

const MOCK_INVITE: InviteDetails = {
    email: 'invitee@example.com',
    status: 'pending',
    has_account: false,
    tenant: { id: 'mock-tenant', name: 'Mock Tenant' },
    role: { code: 'operator', name: 'Operator', role_type: 'operator' },
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
}

// GET /invites/accept?token=... — unauthenticated lookup so an invitee with no account yet
// can see who invited them and to what before deciding whether to log in or register.
export async function getInviteDetails(token: string): Promise<InviteDetails> {
    if (isDevBypass()) {
        return MOCK_INVITE
    }

    try {
        const res = await thunderCore.get<ThunderResponse<InviteDetails>>('/invites/accept', { params: { token } })
        return res.data.data
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const data = error.response.data as { message?: string; error?: string }
            throw new Error(data.message || data.error || `Failed to load invitation (${error.response.status})`)
        }
        throw error
    }
}

// POST /invites/accept — requires the caller to already be logged in as the invited email;
// the backend rejects a mismatch. Promotes the pending invitation into an active membership.
export async function acceptInvite(token: string): Promise<AcceptInviteResult> {
    if (isDevBypass()) {
        return { membership_id: crypto.randomUUID(), tenant_id: MOCK_INVITE.tenant?.id ?? 'mock-tenant', status: 'active' }
    }

    try {
        const res = await thunderCore.post<ThunderResponse<AcceptInviteResult>>('/invites/accept', { token })
        return res.data.data
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const data = error.response.data as { message?: string; error?: string }
            throw new Error(data.message || data.error || `Failed to accept invitation (${error.response.status})`)
        }
        throw error
    }
}
