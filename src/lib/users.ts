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
