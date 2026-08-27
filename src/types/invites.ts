export type InviteStatus = 'pending' | 'expired' | 'accepted' | 'cancelled'

export interface InviteDetails {
    email: string
    status: InviteStatus
    has_account: boolean
    tenant: { id: string; name: string } | null
    role: { code: string; name: string; role_type: string } | null
    expires_at: string
}

export interface AcceptInviteResult {
    membership_id: string
    tenant_id: string
    status: 'active'
}
