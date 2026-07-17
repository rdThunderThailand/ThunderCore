import { create } from 'zustand'
import { Application } from '@/types/applications'
import {
    getTenantApplications, createApplication,
    updateApplication, deleteApplication,
    getMemberAppAccess, grantMemberAppAccess,
    revokeMemberAppAccess, launchApplication
} from '@/features/platform-tenants/management/[id]/applications/actions'

interface MemberAccess {
    id: string
    user_id: string
    tenant_id: string
    role: string
    user: {
        id: string
        email: string
        full_name: string
    }
    has_access: boolean
}

interface ApplicationStore {
    applications: Application[]
    isLoading: boolean
    searchTerm: string

    // Access management
    memberAccess: MemberAccess[]
    isAccessLoading: boolean

    // Actions
    fetchApplications: (tenantId: string) => Promise<void>
    setSearchTerm: (term: string) => void
    createApp: (data: {
        tenantId: string
        name: string
        description?: string
        environment: 'production' | 'staging' | 'development'
        url?: string
    }) => Promise<Application>
    updateApp: (appId: string, data: {
        name?: string
        description?: string
        status?: 'active' | 'inactive' | 'maintenance'
        environment?: 'production' | 'staging' | 'development'
        url?: string
    }) => Promise<Application>
    deleteApp: (appId: string, tenantId: string) => Promise<void>

    // Access Actions
    fetchMemberAccess: (tenantId: string, appId: string) => Promise<void>
    grantAccess: (tenantId: string, appId: string, memberId: string) => Promise<void>
    revokeAccess: (tenantId: string, appId: string, memberId: string) => Promise<void>
    getLaunchUrl: (tenantId: string, appId: string) => Promise<string>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useApplicationStore = create<ApplicationStore>((set, get) => ({
    applications: [],
    isLoading: false,
    searchTerm: '',
    memberAccess: [],
    isAccessLoading: false,

    setSearchTerm: (searchTerm) => set({ searchTerm }),

    fetchApplications: async (tenantId: string) => {
        try {
            set({ isLoading: true })
            const apps = await getTenantApplications(tenantId)
            set({ applications: apps, isLoading: false })
        } catch (error) {
            console.error('Error fetching applications:', error)
            set({ isLoading: false })
        }
    },

    createApp: async (data) => {
        const newApp = await createApplication(data)
        set((state) => ({ applications: [newApp, ...state.applications] }))
        return newApp
    },

    updateApp: async (appId, data) => {
        const updatedApp = await updateApplication(appId, data)
        set((state) => ({
            applications: state.applications.map(app => app.id === appId ? updatedApp : app)
        }))
        return updatedApp
    },

    deleteApp: async (appId, tenantId) => {
        await deleteApplication(appId, tenantId)
        set((state) => ({
            applications: state.applications.filter(app => app.id !== appId)
        }))
    },

    fetchMemberAccess: async (tenantId, appId) => {
        try {
            set({ isAccessLoading: true, memberAccess: [] })
            const access = await getMemberAppAccess(tenantId, appId)
            set({ memberAccess: access as MemberAccess[], isAccessLoading: false })
        } catch (error) {
            console.error('Error fetching member access:', error)
            set({ isAccessLoading: false })
        }
    },

    grantAccess: async (tenantId, appId, memberId) => {
        await grantMemberAppAccess(tenantId, appId, memberId)
        set((state) => ({
            memberAccess: state.memberAccess.map(m =>
                m.id === memberId ? { ...m, has_access: true } : m
            )
        }))
    },

    revokeAccess: async (tenantId, appId, memberId) => {
        await revokeMemberAppAccess(tenantId, appId, memberId)
        set((state) => ({
            memberAccess: state.memberAccess.map(m =>
                m.id === memberId ? { ...m, has_access: false } : m
            )
        }))
    },

    getLaunchUrl: async (tenantId, appId) => {
        return await launchApplication(tenantId, appId)
    }
}))
