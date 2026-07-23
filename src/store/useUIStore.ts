import { create } from 'zustand'

interface UIStore {
    // Global Sidebar (Main Dashboard)
    isSidebarCollapsed: boolean
    setIsSidebarCollapsed: (collapsed: boolean) => void
    toggleSidebar: () => void

    // Local Sidebar (e.g., Assets module)
    isLocalSidebarCollapsed: boolean
    setIsLocalSidebarCollapsed: (collapsed: boolean) => void
    toggleLocalSidebar: () => void

    // Theme / Language (Optional extension)
    language: string
    setLanguage: (lang: string) => void

}

export const useUIStore = create<UIStore>((set) => ({
    // Global Sidebar
    isSidebarCollapsed: false,
    setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

    // Local Sidebar
    isLocalSidebarCollapsed: false,
    setIsLocalSidebarCollapsed: (isLocalSidebarCollapsed) => set({ isLocalSidebarCollapsed }),
    toggleLocalSidebar: () => set((state) => ({ isLocalSidebarCollapsed: !state.isLocalSidebarCollapsed })),

    // Language
    language: 'en',
    setLanguage: (language) => set({ language }),

}))
