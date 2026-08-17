import { create } from 'zustand'
import { UserRole } from '@/types/auth'
import { getDevRole } from '@/lib/dev'

export interface UserProfile {
    name: string
    role: UserRole
    email: string
    avatar_url: string
}

// role comes from NEXT_PUBLIC_DEV_ROLE — change it in .env, no code edit needed.
export const mockUser: UserProfile = {
    name: "หัวหน้าพีชพีชพีชพีช",
    role: getDevRole(),
    email: "peach@gmail.com",
    avatar_url: "https://ichef.bbci.co.uk/ace/standard/609/cpsprodpb/a0d9/live/211e77d0-7cd1-11f1-926f-c90d1bcfbc84.jpg"
}


interface AuthStore {
    user: UserProfile | null
    role: UserRole
    isLoading: boolean
    userOrgId: string | null
    setRole: (role: UserRole) => void
    setUser: (user: UserProfile | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    role: getDevRole(),
    isLoading: true,
    userOrgId: null,
    setRole: (role) => set({ role }),
    setUser: (user) => set({ user, role: user?.role ?? getDevRole(), isLoading: false }),
}))
