import { create } from 'zustand'
import { UserRole } from '@/types/auth'

export interface UserProfile {
    name: string
    role: string
    email: string
    avatar_url: string
}

export const mockUser: UserProfile = {
    name: "หัวหน้าพีชพีชพีชพีช",
    role: "super_admin",
    email: "peach@gmail.com",
    avatar_url: "https://ichef.bbci.co.uk/ace/standard/609/cpsprodpb/a0d9/live/211e77d0-7cd1-11f1-926f-c90d1bcfbc84.jpg"
}

// export const mockUser: UserProfile = {
//     name: "พีชพีชพีชพีช",
//     role: "company_admin",
//     email: "peach@gmail.com",
//     avatar_url: "https://ichef.bbci.co.uk/ace/standard/609/cpsprodpb/a0d9/live/211e77d0-7cd1-11f1-926f-c90d1bcfbc84.jpg"
// }


interface AuthStore {
    user: UserProfile | null
    role: UserRole
    isLoading: boolean
    userOrgId: string | null


}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    role: 'operator',
    isLoading: true,
    userOrgId: null,

    setRole: (role) => set({ role })


}))
