import { create } from 'zustand'
import {
    Application, ApplicationDetails, AppMember,
    ApplicationTenantAccess, ApplicationTenantsAccess, UpdateApplicationDTO,
} from '@/types/applications'
import {
    getTenantApplications, createApplication as createTenantApplication,
    updateApplication as updateTenantApplication, deleteApplication as deleteTenantApplication,
    revokeMemberAppAccess, inviteMember as inviteTenantAppMember, launchApplication
} from '@/features/platform-tenants/management/[id]/applications/actions'
import {
    getApplicationById, getApplicationMembers, getApplicationTenants,
    addApplicationAuthorization, removeApplicationAuthorization,
    getApiKey, regenerateApiKey, getTenantsForSelect,
    updateApplication as updateApplicationDetail,
    deleteApplication as deleteApplicationDetail,
} from '@/features/platform-applications/actions'

type ApiKeyRecord = { api_key: string | null; api_key_generated_at: string | null }

interface ApplicationStore {
    applications: Application[]
    isLoading: boolean
    searchTerm: string

    // Single-application detail (app-management surface: dashboard/portal/settings/members)
    currentApp: ApplicationDetails | null
    isAppLoading: boolean

    // Members with access to currentApp
    applicationMembers: AppMember[]
    isMembersLoading: boolean

    // Tenants authorized on currentApp
    applicationTenants: ApplicationTenantsAccess[]
    isTenantsLoading: boolean

    apiKey: ApiKeyRecord | null
    isApiKeyLoading: boolean

    // Owner picker for the create-application modal
    tenantOptions: Array<{ id: string; name: string }>

    // Tenant-scoped application list actions
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
    getLaunchUrl: (tenantId: string, appId: string) => Promise<string>

    // Single-application detail actions
    fetchApplicationById: (appId: string) => Promise<ApplicationDetails | null>
    updateApplicationDetail: (appId: string, data: UpdateApplicationDTO) => Promise<Application | undefined>
    deleteApplicationById: (appId: string) => Promise<void>

    // Application members (who has access), see docs/api-checklist.md §4/§5
    fetchApplicationMembers: (appId: string) => Promise<void>
    revokeAccess: (tenantId: string, appId: string, accessId: string, membershipId: string) => Promise<void>
    inviteAppMember: (tenantId: string, appId: string, memberId: string, role: AppMember['role']) => Promise<void>

    // Tenant authorization on a single application
    fetchApplicationTenants: (appId: string) => Promise<void>
    addTenantAuthorization: (data: ApplicationTenantAccess) => Promise<void>
    removeTenantAuthorization: (appId: string, tenantId: string) => Promise<void>

    // API key
    fetchApiKey: (appId: string) => Promise<void>
    regenerateApplicationApiKey: (appId: string) => Promise<void>

    fetchTenantsForSelect: () => Promise<void>
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
    applications: [],
    isLoading: false,
    searchTerm: '',

    currentApp: null,
    isAppLoading: false,

    applicationMembers: [],
    isMembersLoading: false,

    applicationTenants: [],
    isTenantsLoading: false,

    apiKey: null,
    isApiKeyLoading: false,

    tenantOptions: [],

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
        const newApp = await createTenantApplication(data)
        set((state) => ({ applications: [newApp, ...state.applications] }))
        return newApp
    },

    updateApp: async (appId, data) => {
        const updatedApp = await updateTenantApplication(appId, data)
        set((state) => ({
            applications: state.applications.map(app => app.id === appId ? updatedApp : app)
        }))
        return updatedApp
    },

    deleteApp: async (appId, tenantId) => {
        await deleteTenantApplication(appId, tenantId)
        set((state) => ({
            applications: state.applications.filter(app => app.id !== appId)
        }))
    },

    getLaunchUrl: async (tenantId, appId) => {
        return await launchApplication(tenantId, appId)
    },

    fetchApplicationById: async (appId) => {
        try {
            set({ isAppLoading: true })
            const app = await getApplicationById(appId)
            set({ currentApp: app, isAppLoading: false })
            return app
        } catch (error) {
            console.error('Error fetching application:', error)
            set({ isAppLoading: false })
            throw error
        }
    },

    updateApplicationDetail: async (appId, data) => {
        const updatedApp = await updateApplicationDetail(appId, data)
        set((state) => ({
            currentApp: state.currentApp?.id === appId ? { ...state.currentApp, ...updatedApp } : state.currentApp
        }))
        return updatedApp
    },

    deleteApplicationById: async (appId) => {
        await deleteApplicationDetail(appId)
        set((state) => ({ currentApp: state.currentApp?.id === appId ? null : state.currentApp }))
    },

    fetchApplicationMembers: async (appId) => {
        try {
            set({ isMembersLoading: true })
            const members = await getApplicationMembers(appId)
            set({ applicationMembers: members, isMembersLoading: false })
        } catch (error) {
            console.error('Error fetching application members:', error)
            set({ isMembersLoading: false })
        }
    },

    revokeAccess: async (tenantId, appId, accessId, membershipId) => {
        await revokeMemberAppAccess(tenantId, appId, membershipId)
        set((state) => ({
            applicationMembers: state.applicationMembers.filter(m => m.id !== accessId)
        }))
    },

    inviteAppMember: async (tenantId, appId, memberId, role) => {
        await inviteTenantAppMember(tenantId, appId, memberId, role)
        await get().fetchApplicationMembers(appId)
    },

    fetchApplicationTenants: async (appId) => {
        try {
            set({ isTenantsLoading: true })
            const tenants = await getApplicationTenants(appId)
            set({ applicationTenants: tenants, isTenantsLoading: false })
        } catch (error) {
            console.error('Error fetching application tenants:', error)
            set({ isTenantsLoading: false })
        }
    },

    addTenantAuthorization: async (data) => {
        await addApplicationAuthorization(data)
        const tenants = await getApplicationTenants(data.appId)
        set({ applicationTenants: tenants })
    },

    removeTenantAuthorization: async (appId, tenantId) => {
        await removeApplicationAuthorization(appId, tenantId)
        set((state) => ({
            applicationTenants: state.applicationTenants.filter(t => t.tenant_id !== tenantId)
        }))
    },

    fetchApiKey: async (appId) => {
        try {
            set({ isApiKeyLoading: true })
            const key = await getApiKey(appId)
            set({ apiKey: key, isApiKeyLoading: false })
        } catch (error) {
            console.error('Error fetching API key:', error)
            set({ isApiKeyLoading: false })
        }
    },

    regenerateApplicationApiKey: async (appId) => {
        set({ isApiKeyLoading: true })
        try {
            const key = await regenerateApiKey(appId)
            set({ apiKey: key, isApiKeyLoading: false })
        } catch (error) {
            set({ isApiKeyLoading: false })
            throw error
        }
    },

    fetchTenantsForSelect: async () => {
        const tenants = await getTenantsForSelect()
        set({ tenantOptions: tenants })
    },
}))
