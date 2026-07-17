import { GetMembersOptions, Membership } from '@/types/members'
import { isDevBypass } from './dev'
import { MOCK_MEMBERS } from './mock/members'

// Living endpoint catalog — each signature is the future REST contract.
// Swap the body to axios (core/v1/tenants/:id/members) when the endpoint lands; callers don't change.

export async function getMemberships(
    tenantId: string,
    options: GetMembersOptions = {}
): Promise<{ data: Membership[]; count: number }> {
    if (isDevBypass()) {
        const { page = 1, limit = 8, search = '' } = options
        const term = search.trim().toLowerCase()

        const filtered = MOCK_MEMBERS.filter((m) => {
            if (m.tenant_id !== tenantId) return false
            if (!term) return true
            return (
                m.user?.email?.toLowerCase().includes(term) ||
                m.user?.full_name?.toLowerCase().includes(term)
            )
        })

        const start = (page - 1) * limit
        return {
            data: filtered.slice(start, start + limit),
            count: filtered.length,
        }
    }
    // ponytail: Supabase shim — replace with axios GET core/v1/tenants/:id/members when it exists
    throw new Error('getMemberships: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data')
}

type AddMembershipInput = { tenantId: string; email: string; role: 'admin' | 'member' }

export async function addMembership(input: AddMembershipInput): Promise<Membership> {
    if (!isDevBypass()) throw new Error('addMembership: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: echo a shaped row so the client can render it; real POST returns the server row.
    // Not persisted across requests in bypass mode — the client holds it in local state.
    return {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        tenant_id: input.tenantId,
        role: input.role,
        joined_at: new Date().toISOString(),
        user: {
            id: crypto.randomUUID(),
            email: input.email,
            full_name: input.email.split('@')[0],
        },
    }
}

export async function removeMembership(_memberId: string, _tenantId: string): Promise<void> {
    if (!isDevBypass()) throw new Error('removeMembership: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client drops it from local state.
}

export async function updateMemberRole(
    _memberId: string,
    _tenantId: string,
    _role: 'admin' | 'member'
): Promise<void> {
    if (!isDevBypass()) throw new Error('updateMemberRole: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client holds the updated role in local state.
}
