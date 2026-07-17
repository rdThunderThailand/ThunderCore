import { create } from 'zustand'
import { Membership } from '@/types/members'
import {
    getMemberships, addMembership,
    removeMembership, updateMemberRole
} from '@/features/platform-tenants/management/[id]/members/actions'

interface MemberStore {
    members: Membership[]
    totalCount: number
    isLoading: boolean
    searchTerm: string
    currentPage: number
    itemsPerPage: number

    // Actions
    fetchMembers: (tenantId: string) => Promise<void>
    setSearchTerm: (term: string) => void
    setCurrentPage: (page: number) => void
    inviteMember: (tenantId: string, email: string, role: 'admin' | 'member') => Promise<void>
    removeMember: (tenantId: string, memberId: string) => Promise<void>
    changeRole: (tenantId: string, memberId: string, role: 'admin' | 'member') => Promise<void>
}

export const useMemberStore = create<MemberStore>((set, get) => ({
    members: [],
    totalCount: 0,
    isLoading: false,
    searchTerm: '',
    currentPage: 1,
    itemsPerPage: 8,

    setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
    setCurrentPage: (currentPage) => set({ currentPage }),

    fetchMembers: async (tenantId: string) => {
        try {
            set({ isLoading: true })
            const state = get()
            const res = await getMemberships(tenantId, {
                page: state.currentPage,
                limit: state.itemsPerPage,
                search: state.searchTerm
            })
            set({
                members: res.data,
                totalCount: res.count,
                isLoading: false
            })
        } catch (error) {
            console.error('Error fetching members:', error)
            set({ isLoading: false })
        }
    },

    inviteMember: async (tenantId: string, email: string, role: 'admin' | 'member') => {
        const newMember = await addMembership({
            tenantId: tenantId,
            email,
            role
        })
        set((state) => ({
            members: [newMember, ...state.members],
            totalCount: state.totalCount + 1
        }))
    },

    removeMember: async (tenantId: string, memberId: string) => {
        await removeMembership(memberId, tenantId)
        const state = get()
        // Optimistic update + refetch to handle pagination
        set({
            members: state.members.filter(m => m.id !== memberId),
            totalCount: state.totalCount - 1
        })
        await state.fetchMembers(tenantId)
    },

    changeRole: async (tenantId: string, memberId: string, newRole: 'admin' | 'member') => {
        await updateMemberRole(memberId, tenantId, newRole)
        set((state) => ({
            members: state.members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
        }))
    }
}))
