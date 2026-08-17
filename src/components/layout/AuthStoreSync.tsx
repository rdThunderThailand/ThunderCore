'use client'

import { useAuthStore, type UserProfile } from '@/store/useAuthStore'
import { useEffect } from 'react'

// Hydrates the client-side auth store with the server-resolved session user (see
// resolveCurrentUser() in DashboardLayout) so `role` reflects the real logged-in user
// instead of staying stuck at the NEXT_PUBLIC_DEV_ROLE default forever.
export function AuthStoreSync({ user }: { user: UserProfile }) {
    const setUser = useAuthStore((s) => s.setUser)

    useEffect(() => {
        setUser(user)
    }, [user, setUser])

    return null
}
