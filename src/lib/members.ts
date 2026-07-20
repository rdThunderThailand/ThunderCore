import { GetMembersOptions, MemberDetails, Membership } from '@/types/members'
import { isDevBypass } from './dev'
import { MOCK_MEMBERS } from './mock/members'
import { thunderCore } from './thunder-core'

const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

type ThunderResponse<T> = { success: boolean; data: T }
type ThunderMemberShipsPayload = { data: Membership[], count: number }
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

    const res = await thunderCore.get<ThunderResponse<ThunderMemberShipsPayload>>(`/tenants/${tenantId}/members`)
    return res.data.data

    // ponytail: Supabase shim — replace with axios GET core/v1/tenants/:id/members when it exists
}

type AddMembershipInput = { tenantId: string; email: string; role: 'admin' | 'member' }

export async function addMembership(input: AddMembershipInput): Promise<Membership> {
    const { tenantId } = input
    if (!isDevBypass())
    // throw new Error('addMembership: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: echo a shaped row so the client can render it; real POST returns the server row.
    // Not persisted across requests in bypass mode — the client holds it in local state.
    {
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
            }
        }
    }

    const res = await thunderCore.post<ThunderResponse<Membership>>(`/tenants/${tenantId}/members`)
    return res.data.data
}

export async function removeMembership(_memberId: string, _tenantId: string): Promise<void> {
    if (!isDevBypass()) {
        const res = await thunderCore.delete<ThunderResponse<void>>(`/tenants/${_tenantId}/members/${_memberId}`)
        if (!res.data.success) {
            throw new Error('Failed to remove membership')
        }
    }
    // throw new Error('removeMembership: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client drops it from local state.
}

export async function updateMemberRole(
    _memberId: string,
    _tenantId: string,
    _role: 'admin' | 'member'
): Promise<void> {
    if (!isDevBypass()) {
        const res = await thunderCore.patch<ThunderResponse<void>>(`/tenants/${_tenantId}/members/${_memberId}`)
        if (!res.data.success) {
            throw new Error('Failed to update member role')
        }
    }
    // throw new Error('updateMemberRole: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client holds the updated role in local state.
}

export async function getMemberDetails(memberId: string, tenantId: string): Promise<MemberDetails> {
    if (isDevBypass()) {
        const member = MOCK_MEMBERS.find((m) => m.id === memberId && m.tenant_id === tenantId)
        if (!member) throw new Error('getMemberDetails: member not found')

        const fullName = member.user?.full_name ?? ''
        const [firstName, ...rest] = fullName.split(' ')

        return {
            ...member,
            profiles: {
                first_name: firstName ?? '',
                last_name: rest.join(' '),
                email: member.user?.email ?? '',
            },
        }
    }
    const res = await thunderCore.get<ThunderResponse<MemberDetails>>(`/tenants/${tenantId}/members/${memberId}`)

    return res.data.data
    // return noEndpoint('getMemberDetails')
}

type UpdateMemberProfileInput = { first_name: string; last_name: string }

export async function updateMemberProfile(_userId: string, _data: UpdateMemberProfileInput): Promise<void> {
    if (!isDevBypass()) noEndpoint('updateMemberProfile')
    // ponytail: no-op in bypass; client holds the updated profile in local state.
}
