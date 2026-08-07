import { GetMembersOptions, MemberDetails, Membership, TenantRole } from '@/types/members'
import { isDevBypass } from './dev'
import { MOCK_MEMBERS } from './mock/members'
import { isAxiosError, thunderCore } from './thunder-core'

export function mapRoleToBackend(role: string): string {
    switch (role) {
        case '≈':
            return 'executive_viewer'
        case 'Department Admin':
            return 'department_admin'
        case 'Company Admin':
            return 'company_admin'
        case 'Operator':
            return 'operator'
        case 'Auditor':
            return 'viewer_auditor'
        default:
            return role.toLowerCase().replace(/\s+/g, '_')
    }
}

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
        const { page = 1, search = '' } = options
        const term = search.trim().toLowerCase()

        const filtered = MOCK_MEMBERS.filter((m) => {
            if (m.tenant_id !== tenantId) return false
            if (!term) return true
            return (
                m.user?.email?.toLowerCase().includes(term) ||
                m.user?.full_name?.toLowerCase().includes(term)
            )
        })

        // const start = (page - 1)
        return {
            data: filtered,
            count: filtered.length,
        }
    }

    const res = await thunderCore.get<ThunderResponse<ThunderMemberShipsPayload>>(`/tenants/${tenantId}/members`, { params: options })
    // console.log('res', res.data.data)
    return res.data.data


    // ponytail: Supabase shim — replace with axios GET core/v1/tenants/:id/members when it exists
}

type AddMembershipInput = { tenantId: string; email: string; role: TenantRole }

export async function addMembership(input: AddMembershipInput): Promise<Membership> {
    if (isDevBypass()) {
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

    try {
        const backendRole = mapRoleToBackend(input.role)
        const res = await thunderCore.post<ThunderResponse<Membership>>(
            `/tenants/${input.tenantId}/members`,
            { email: input.email, role_code: backendRole, role: backendRole }
        )
        return res.data.data
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const data = error.response.data as { message?: string; error?: string }
            throw new Error(data.message || data.error || `Failed to add member (${error.response.status})`)
        }
        throw error
    }
}

export async function removeMembership(memberId: string, tenantId: string): Promise<void> {
    if (isDevBypass()) {
        return
    }
    try {
        const res = await thunderCore.delete<ThunderResponse<void>>(`/tenants/${tenantId}/members/${memberId}`)
        if (!res.data?.success && res.data?.success !== undefined) {
            throw new Error('Failed to remove membership')
        }
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const data = error.response.data as { message?: string; error?: string }
            throw new Error(data.message || data.error || `Failed to remove member (${error.response.status})`)
        }
        throw error
    }
}

export async function updateMemberRole(
    memberId: string,
    tenantId: string,
    role: TenantRole
): Promise<void> {
    if (isDevBypass()) return

    try {
        const backendRole = mapRoleToBackend(role)
        await thunderCore.patch(`/tenants/${tenantId}/members/${memberId}/role`, {
            role_code: backendRole,
            role: backendRole
        })
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const data = error.response.data as { message?: string; error?: string }
            throw new Error(data.message || data.error || `Failed to update member role (${error.response.status})`)
        }
        throw error
    }
}

export async function getMemberDetails(memberId: string, tenantId: string): Promise<MemberDetails> {
    if (isDevBypass()) {
        const member = MOCK_MEMBERS.find((m) => m.id === memberId || m.user_id === memberId) || MOCK_MEMBERS[0]

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

    const res = await thunderCore.get<ThunderResponse<any>>(`/tenants/${tenantId}/members/${memberId}`)
    const data = res.data.data

    const fullName = data?.user?.full_name || data?.profiles?.full_name || data?.full_name || ''
    const [firstName, ...rest] = fullName.split(' ')
    const rawRole = data?.role || data?.role_code || data?.role_type || ''

    return {
        ...data,
        role: rawRole,
        profiles: {
            first_name: data?.profiles?.first_name || firstName || '',
            last_name: data?.profiles?.last_name || rest.join(' ') || '',
            email: data?.profiles?.email || data?.user?.email || data?.email || '',
        },
    }
}

type UpdateMemberProfileInput = { first_name: string; last_name: string }

export async function updateMemberProfile(userId: string, data: UpdateMemberProfileInput): Promise<void> {
    if (isDevBypass()) return

    try {
        await thunderCore.patch(`/users/${userId}`, {
            first_name: data.first_name,
            last_name: data.last_name
        })
    } catch (error) {
        if (isAxiosError(error) && error.response?.data) {
            const resData = error.response.data as { message?: string; error?: string }
            throw new Error(resData.message || resData.error || `Failed to update profile (${error.response.status})`)
        }
        throw error
    }
}
