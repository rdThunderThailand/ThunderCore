import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Asset, AssetFolder, AssetRegistryStatus, TenantQuota } from '@/types/assets'
import { getAssetDashboardData } from '@/features/platform-tenants/management/[id]/assets/actions'
import type { AssetWithDevices } from '@/types/asset-management'
import { getAssetsV2 } from '@/features/tenant-assets/asset-v2-actions'

interface AssetStore {
    // Data States
    assets: Asset[]
    totalCount: number
    folders: AssetFolder[]
    quota: TenantQuota
    isLoading: boolean

    // V2 Assets
    v2Assets: AssetWithDevices[]
    selectedV2AssetId: string | null
    setSelectedV2AssetId: (id: string | null) => void
    fetchV2Assets: (tenantId: string) => Promise<void>

    // Tabs & Filters
    activeTab: 'unregister' | 'player'
    setActiveTab: (tab: 'unregister' | 'player') => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    statusFilter: string
    setStatusFilter: (status: string) => void
    sortBy: 'newest' | 'oldest' | 'name_asc' | 'name_desc'
    setSortBy: (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => void

    // Tags
    availableTags: string[]
    selectedTags: string[]
    toggleTagFilter: (tag: string) => void
    clearTagFilters: () => void

    // Pagination
    currentPage: number
    setCurrentPage: (page: number) => void
    itemsPerPage: number

    // Folder State
    selectedFolderId: string | null
    setSelectedFolderId: (id: string | null) => void
    expandedFolders: Record<string, boolean>
    setExpandedFolders: (expanded: Record<string, boolean>) => void
    toggleFolderExpanded: (id: string) => void

    // UI States
    contextMenu: { type: 'folder' | 'root' | 'asset' | null, x: number, y: number, folderId: string | null } | null
    setContextMenu: (menu: { type: 'folder' | 'root' | 'asset' | null, x: number, y: number, folderId: string | null } | null) => void

    fetchData: (tenantId: string, isSilent?: boolean) => Promise<void>
    updateAssetStatus: (id: string, connection_status: 'online' | 'offline' | 'busy', last_heartbeat_at: string) => void
    // Reset Helpers
    resetFilters: () => void
}

export const useAssetStore = create<AssetStore>()(
    persist(
        (set, get) => ({
            // Data States
            assets: [],
            totalCount: 0,
            folders: [],
            quota: { used: 0, total: 50, remaining: 50 },
            isLoading: true,

            // V2 Assets
            v2Assets: [],
            selectedV2AssetId: null,
            setSelectedV2AssetId: (selectedV2AssetId) => set({ selectedV2AssetId }),
            fetchV2Assets: async (tenantId: string) => {
                try {
                    const v2Assets = await getAssetsV2(tenantId)
                    set({ v2Assets })
                } catch (error) {
                    console.error('Failed to fetch v2 assets:', error)
                }
            },

            // Tabs & Filters
            activeTab: 'unregister',
            setActiveTab: (activeTab) => set({ activeTab, currentPage: 1, statusFilter: 'all' }), // Reset page & status on tab change
            searchTerm: '',
            setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
            statusFilter: 'all',
            setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),
            sortBy: 'newest',
            setSortBy: (sortBy) => set({ sortBy }),

            // Tags
            availableTags: [],
            selectedTags: [],
            toggleTagFilter: (tag) => set((state) => ({
                selectedTags: state.selectedTags.includes(tag)
                    ? state.selectedTags.filter(t => t !== tag)
                    : [...state.selectedTags, tag],
                currentPage: 1
            })),
            clearTagFilters: () => set({ selectedTags: [], currentPage: 1 }),

            // Pagination
            currentPage: 1,
            setCurrentPage: (currentPage) => set({ currentPage }),
            itemsPerPage: 12,

            // Folder State
            selectedFolderId: null,
            setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId, currentPage: 1 }),
            expandedFolders: {},
            setExpandedFolders: (expandedFolders) => set({ expandedFolders }),
            toggleFolderExpanded: (id) => set((state) => ({
                expandedFolders: {
                    ...state.expandedFolders,
                    [id]: !state.expandedFolders[id]
                }
            })),

            // UI States
            contextMenu: null,
            setContextMenu: (contextMenu) => set({ contextMenu }),

            // Actions
            fetchData: async (tenantId: string, isSilent = false) => {
                try {
                    if (!isSilent) set({ isLoading: true })
                    const state = get()

                    // Fetch V2 assets concurrently
                    getAssetsV2(tenantId).then(v2Assets => set({ v2Assets })).catch(console.error)

                    const { assets, quota, folders, availableTags } = await getAssetDashboardData(tenantId, {
                        page: state.currentPage,
                        limit: state.itemsPerPage,
                        search: state.searchTerm,
                        status: state.statusFilter,
                        folderId: state.selectedFolderId,
                        sortBy: state.sortBy,
                        activeTab: state.activeTab,
                        tags: state.selectedTags,
                        v2AssetId: state.selectedV2AssetId
                    })
                    set({
                        assets: assets.data,
                        totalCount: assets.count,
                        quota: quota,
                        folders: folders,
                        availableTags: availableTags || [],
                        isLoading: false
                    })
                } catch (error) {
                    console.error('Failed to fetch assets:', error)
                    set({ isLoading: false })
                }
            },

            updateAssetStatus: (id: string, connection_status: 'online' | 'offline' | 'busy', last_heartbeat_at: string) => {
                const currentAssets = get().assets
                const updatedAssets = currentAssets.map(asset =>
                    asset.id === id
                        ? { ...asset, connection_status, last_heartbeat_at }
                        : asset
                )
                set({ assets: updatedAssets })
            },

            // Reset Helpers
            resetFilters: () => set({
                searchTerm: '',
                statusFilter: 'all',
                sortBy: 'newest',
                selectedFolderId: null,
                selectedV2AssetId: null,
                selectedTags: [],
                currentPage: 1
            })
        }),
        {
            name: 'thunder-asset-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                activeTab: state.activeTab,
                expandedFolders: state.expandedFolders,
                sortBy: state.sortBy,
                statusFilter: state.statusFilter,
                selectedFolderId: state.selectedFolderId,
                selectedTags: state.selectedTags
            })
        }
    )
)
