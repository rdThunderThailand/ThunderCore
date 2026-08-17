import { isDevBypass } from '@/lib/dev'
import { getCurrentUser, isAxiosError } from '@/lib/thunder-core'
import { mockUser, type UserProfile } from '@/store/useAuthStore'
import { redirect } from 'next/navigation'

export async function resolveCurrentUser(): Promise<UserProfile> {
    if (isDevBypass()) return mockUser

    try {
        const current = await getCurrentUser()
        return {
            name: current.display_name || [current.first_name, current.last_name].filter(Boolean).join(' ') || current.email,
            role: current.role,
            email: current.email,
            avatar_url: current.avatar_url ?? '',
        }
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) redirect('/login')
        throw error
    }
}
