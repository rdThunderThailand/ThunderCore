import { create } from 'zustand'
import { supabase } from '@/utils/supabase/client'
import { UserRole } from '@/types/auth'
import { getUserRole } from '@/utils/supabase/rbac'

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

    fetchUser: () => Promise<void>
    setRole: (role: UserRole) => void
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    role: 'operator',
    isLoading: true,
    userOrgId: null,

    setRole: (role) => set({ role }),

    fetchUser: async () => {
        try {
            set({ isLoading: true })
            const { data: { user: supabaseUser } } = await supabase.auth.getUser()

            if (supabaseUser) {
                // Fetch Role
                const fetchedRole = await getUserRole(supabase, supabaseUser)

                // Fetch Profile Data (single query)
                const { data: profileData } = await supabase
                    .from('users')
                    .select('first_name, last_name, avatar_url')
                    .eq('id', supabaseUser.id)
                    .single()

                let roleDisplay = fetchedRole as string
                let tenantId = null

                if (fetchedRole !== 'super_admin') {
                    const { data: membershipData } = await supabase
                        .from('memberships')
                        .select(`
                            tenant_id,
                            tenants:tenant_id (
                                name
                            )
                        `)
                        .eq('user_id', supabaseUser.id)
                        .single()

                    if (membershipData) {
                        roleDisplay = fetchedRole
                        tenantId = membershipData.tenant_id
                    }
                }

                const firstName = profileData?.first_name || supabaseUser.user_metadata?.first_name || ""
                const lastName = profileData?.last_name || supabaseUser.user_metadata?.last_name || ""
                const fullName = `${firstName} ${lastName}`.trim() || supabaseUser.email?.split('@')[0] || "User"

                set({
                    user: {
                        name: fullName,
                        role: roleDisplay.charAt(0).toUpperCase() + roleDisplay.slice(1),
                        email: supabaseUser.email || "",
                        avatar_url: profileData?.avatar_url || ""
                    },
                    role: fetchedRole,
                    userOrgId: tenantId,
                    isLoading: false
                })
            } else {
                set({ user: null, role: 'operator', userOrgId: null, isLoading: false })
            }
        } catch (error) {
            console.error('Error fetching user:', error)
            set({ isLoading: false })
        }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, role: 'operator', userOrgId: null })
    }
}))
