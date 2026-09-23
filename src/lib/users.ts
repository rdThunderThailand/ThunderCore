import { Profile } from '@/types/dashboard'
import { isDevBypass } from './dev'
import { MOCK_USERS } from './mock/users'
import { thunderCore } from './thunder-core'

// Living endpoint catalog — each signature is the future REST contract.
export async function getUsers(): Promise<Profile[]> {
    if (isDevBypass()) return MOCK_USERS as unknown as Profile[]

    // ponytail: Supabase shim removed — uses GET /users
    const res = await thunderCore.get<{ success: boolean; data: Profile[] }>('/users')
    return res.data.data
}

export type InviteUserInput = {
    email: string
    first_name?: string
    last_name?: string
    role: 'super_admin' | 'company_admin' | 'guest'
}

export type InviteUserResult = Profile & { invite_link: string | null }

export async function inviteUser(input: InviteUserInput): Promise<InviteUserResult> {
    if (isDevBypass()) {
        const mock: InviteUserResult = {
            id: `mock-${Date.now()}`,
            email: input.email,
            first_name: input.first_name ?? '',
            last_name: input.last_name ?? '',
            role_code: input.role === 'guest' ? null : input.role,
            role_type: input.role === 'guest' ? null : input.role,
            can_invite: input.role !== 'guest',
            can_create_app: input.role !== 'guest',
            can_view_logs: input.role === 'super_admin',
            created_at: new Date().toISOString(),
            is_active: true,
            invite_link: 'https://example.com/mock-invite-link',
        }
        return mock
    }

    // ponytail: uses POST /users — see thunder_core_API src/app/api/core/v1/users/route.ts.
    // Returns invite_link instead of sending an email — the Send Email hook isn't wired up in the
    // Supabase dashboard for the real project yet (deferred, see project memory), so the caller
    // hands this link to the invitee directly.
    const res = await thunderCore.post<{ success: boolean; data: InviteUserResult }>('/users', input)
    return res.data.data
}

export type UpdateUserInput = {
    first_name?: string | null
    last_name?: string | null
}

export async function updateUser(id: string, patch: UpdateUserInput): Promise<Pick<Profile, 'id' | 'email' | 'first_name' | 'last_name'>> {
    if (isDevBypass()) {
        // ponytail: no-op in bypass; caller keeps the locally edited values.
        const mock = (MOCK_USERS as unknown as Profile[]).find((u) => u.id === id)
        return { id, email: mock?.email ?? '', first_name: patch.first_name ?? mock?.first_name ?? '', last_name: patch.last_name ?? mock?.last_name ?? '' }
    }

    // ponytail: Supabase shim removed — uses PATCH /users/:id
    const res = await thunderCore.patch<{ success: boolean; data: Pick<Profile, 'id' | 'email' | 'first_name' | 'last_name'> }>(`/users/${id}`, patch)
    return res.data.data
}

export async function deleteUser(id: string): Promise<void> {
    if (isDevBypass()) {
        // ponytail: no-op in bypass; client drops it from local state.
        return
    }

    // ponytail: Supabase shim removed — uses DELETE /users/:id
    await thunderCore.delete(`/users/${id}`)
}

export async function updateUserRole(_id: string, _role: string): Promise<void> {
    if (!isDevBypass()) throw new Error('updateUserRole: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client applies the new role to local state.
}
