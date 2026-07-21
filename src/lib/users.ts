import { Profile } from '@/types/dashboard'
import { isDevBypass } from './dev'
import { MOCK_USERS } from './mock/users'

// Living endpoint catalog — each signature is the future REST contract.
export async function getUsers(): Promise<Profile[]> {
    if (isDevBypass()) return MOCK_USERS as unknown as Profile[]
    throw new Error('getUsers: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data')
}

export async function deleteUser(_id: string): Promise<void> {
    if (!isDevBypass()) throw new Error('deleteUser: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client drops it from local state.
}

export async function updateUserRole(_id: string, _role: string): Promise<void> {
    if (!isDevBypass()) throw new Error('updateUserRole: no REST endpoint yet — enable NEXT_PUBLIC_DEV_BYPASS')
    // ponytail: no-op in bypass; client applies the new role to local state.
}
