'use client'

import { Asset } from '@/types/assets'
import {
    AlertCircle, ChevronLeft,
    ChevronRight, Hourglass, LayoutGrid, Loader2, Monitor, Rocket, ShieldCheck, XCircle
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// =====================
// STATUS & ICON HELPERS
// =====================
import { ActivationModal } from './components/activation-modal'
import { AssetCard } from './components/asset-card'
import { AssetsActionBar } from './components/assets-action-bar'
import { AssetDetailPanel } from './components/asset-detail-panel'
import { AssetsSidebar } from './components/assets-sidebar'
import { BulkImportModal } from './components/bulk-import-modal'
import { CreateFolderModal } from './components/create-folder-modal'
import { CredentialsModal } from './components/credentials-modal'
import { RegisterModal } from './components/register-modal'
import { StatCardWithIcon } from './components/stat-card'
import { UnregisterModal } from './components/unregister-modal'

// =====================
// MAIN PAGE
// =====================

import { useAssetStore } from '@/store/useAssetStore'
import { useUIStore } from '@/store/useUIStore'
import Header from '@/components/layout/Header'


// =====================
// MAIN PAGE
// =====================

export function TenantsManagementidAssetsClient({ basePath }: { basePath?: string } = {}) {
    const params = useParams()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const tenantId = params.id as string
    console.log(tenantId)
    const base = basePath ?? `/dashboard/tenants/management/${tenantId}`
    const {
        assets, totalCount, quota, isLoading,
        activeTab,
        searchTerm,
        statusFilter,
        sortBy,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        selectedFolderId,
        selectedTags,
        contextMenu, setContextMenu,
        fetchData, updateAssetStatus,
        v2Assets, selectedV2AssetId
    } = useAssetStore()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isLocalSidebarCollapsed: isSidebarCollapsed, setIsLocalSidebarCollapsed: setIsSidebarCollapsed } = useUIStore()
    console.log(assets, 'ในหน้า ยูไอ')
    // Modals
    const [showRegister, setShowRegister] = useState(false)
    const [showUnregister, setShowUnregister] = useState<Asset | null>(null)
    const [showCredentials, setShowCredentials] = useState<Asset | null>(null)
    const [showBulkImport, setShowBulkImport] = useState(false)
    const [showActivation, setShowActivation] = useState<Asset | null>(null)
    const [showCreateFolder, setShowCreateFolder] = useState<{ isOpen: boolean; parentId: string | null }>({ isOpen: false, parentId: null })
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

    // Sync page & limit from URL searchParams
    useEffect(() => {
        const urlPage = parseInt(searchParams.get('page') || '', 10)
        const urlLimit = parseInt(searchParams.get('limit') || '', 10)

        if (!isNaN(urlPage) && urlPage > 0 && urlPage !== currentPage) {
            setCurrentPage(urlPage)
        }
        if (!isNaN(urlLimit) && urlLimit > 0 && urlLimit !== itemsPerPage) {
            setItemsPerPage(urlLimit)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        const p = new URLSearchParams(searchParams.toString())
        p.set('page', newPage.toString())
        if (itemsPerPage !== 12) p.set('limit', itemsPerPage.toString())
        router.push(`${pathname}?${p.toString()}`, { scroll: false })
    }

    const handleLimitChange = (newLimit: number) => {
        setItemsPerPage(newLimit)
        setCurrentPage(1)
        const p = new URLSearchParams(searchParams.toString())
        p.set('page', '1')
        p.set('limit', newLimit.toString())
        router.push(`${pathname}?${p.toString()}`, { scroll: false })
    }

    // Reset page to 1 whenever any filter option changes
    useEffect(() => {
        setCurrentPage(1)
        const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
        if (p.get('page') && p.get('page') !== '1') {
            p.set('page', '1')
            const newUrl = `${pathname}?${p.toString()}`
            if (typeof window !== 'undefined') {
                window.history.pushState(null, '', newUrl)
            }
            router.replace(newUrl, { scroll: false })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, searchTerm, selectedTags, selectedFolderId, activeTab, sortBy])

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchData(tenantId)
        }, 300)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, currentPage, itemsPerPage, searchTerm, statusFilter, selectedFolderId, selectedV2AssetId, sortBy, activeTab, selectedTags])

    // Real-time subscription for asset status updates (heartbeat)
    // useEffect(() => {
    //     const channel = supabase
    //         .channel('assets_status_changes')
    //         .on(
    //             'postgres_changes',
    //             {
    //                 event: 'UPDATE',
    //                 schema: 'public',
    //                 table: 'assets',
    //                 filter: `tenant_id=eq.${tenantId}`
    //             },
    //             (payload) => {
    //                 const newAsset = payload.new as Partial<Asset>
    //                 if (newAsset && newAsset.id && newAsset.connection_status) {
    //                     updateAssetStatus(newAsset.id, newAsset.connection_status, newAsset.last_heartbeat_at || '')
    //                 }
    //             }
    //         )
    //         .subscribe()

    //     return () => {
    //         supabase.removeChannel(channel)
    //     }
    // }, [tenantId, updateAssetStatus])

    // Frontend UI Filtering & Pagination Logic
    const filteredAssets = assets.filter((asset) => {
        // Status filter check
        if (statusFilter && statusFilter !== 'all') {
            if (['online', 'offline', 'busy'].includes(statusFilter)) {
                if (asset.connection_status !== statusFilter) return false
            } else if (asset.registry_status !== statusFilter) {
                return false
            }
        }

        // Active tab check
        if (activeTab === 'unregister') {
            if (!['pending', 'unregistered'].includes(asset.registry_status)) return false
        } else if (activeTab === 'player') {
            if (asset.registry_status !== 'active') return false
        }

        // Tag filter check
        if (selectedTags && selectedTags.length > 0) {
            if (!asset.tags?.some((t) => selectedTags.includes(t))) return false
        }

        // Search term check
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase()
            const rawTags = (asset.tags ?? []).map((t) => t.split(':::')[0])
            const searchableFields = [
                asset.device_name,
                asset.name,
                asset.serial_number,
                asset.mac_address,
                asset.model,
                asset.site,
                asset.zone,
                ...rawTags,
            ]
            const isMatch = searchableFields.some(
                (field) => field != null && String(field).toLowerCase().includes(term)
            )
            if (!isMatch) return false
        }

        return true
    })

    const effectiveTotalCount = searchTerm.trim()
        ? filteredAssets.length
        : (totalCount || filteredAssets.length)
    const totalPages = Math.ceil(effectiveTotalCount / itemsPerPage)
    const activePage = Math.min(currentPage, Math.max(1, totalPages || 1))

    const fromItem = effectiveTotalCount === 0 ? 0 : (activePage - 1) * itemsPerPage + 1
    const toItem = Math.min(activePage * itemsPerPage, effectiveTotalCount)

    const getPageNumbers = (current: number, total: number) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
        return [1, '...', current - 1, current, current + 1, '...', total]
    }

    // If data returned is already paginated per page (length <= itemsPerPage), display filteredAssets directly.
    // Otherwise, if an unpaginated dataset was returned, slice by activePage.
    const displayAssets = assets.length <= itemsPerPage
        ? filteredAssets
        : filteredAssets.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)

    return (
        <div className="flex h-screen">

            {/* Local Sidebar (Middle Column) */}
            <AssetsSidebar
                setShowCreateFolder={setShowCreateFolder}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex min-w-0 h-screen overflow-hidden">
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                    {/* Top Header replacing global Navbar */}
                    <Header />

                    {/* Main Content Workspace */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-[1400px] mx-auto w-full">
                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                                <StatCardWithIcon label="Total" value={totalCount} icon={Rocket} color="blue" />
                                {/* Assigned/Active/Alerts are placeholders — no backend field yet, see [[assets-stat-row-gaps]] */}
                                <StatCardWithIcon label="Assigned" value={0} icon={Hourglass} color="amber" />
                                <StatCardWithIcon label="Active" value={0} icon={ShieldCheck} color="emerald" />
                                <StatCardWithIcon label="Quota devices" value={quota.total} icon={LayoutGrid} color="purple" />
                                <StatCardWithIcon label="Alerts" value={0} icon={AlertCircle} color="red" />
                            </div>

                            <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col relative h-[calc(100vh-10rem)] overflow-hidden">
                                {/* Action Bar */}
                                <AssetsActionBar
                                    setShowBulkImport={setShowBulkImport}
                                    setShowRegister={setShowRegister}
                                />

                                {/* Content */}
                                <div className="flex-1 bg-white p-6 overflow-y-auto">
                                    {isLoading ? (
                                        <div className="h-96 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                        </div>
                                    ) : assets.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-60">
                                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                                <div className="relative">
                                                    <div className="w-12 h-8 border-2 border-slate-300 rounded-lg mx-auto mb-1" />
                                                    <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto" />
                                                </div>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-400">
                                                {selectedV2AssetId ? 'No Devices Linked' : 'No Devices Found'}
                                            </h3>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-5 content-start items-start">
                                            {displayAssets.map((asset, idx) => (
                                                < AssetCard
                                                    key={asset.id}
                                                    asset={asset}
                                                    tenantId={tenantId}
                                                    index={idx}
                                                    setShowCredentials={setShowCredentials}
                                                    setShowActivation={setShowActivation}
                                                    onSelect={(a) => setSelectedAsset(prev => prev?.id === a.id ? null : a)}
                                                    basePath={base}
                                                />
                                            ))}
                                        </div>
                                    )}

                                </div>

                                {/* Pagination Footer */}
                                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                                    {/* Showing item range & Per Page selector */}
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <p className="text-[12px] font-medium text-slate-500">
                                            Showing <span className="font-bold text-slate-700">{fromItem}</span> to{' '}
                                            <span className="font-bold text-slate-700">{toItem}</span> of{' '}
                                            <span className="font-bold text-slate-700">{effectiveTotalCount}</span> items
                                        </p>

                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <span>Per page:</span>
                                            <select
                                                value={itemsPerPage}
                                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
                                            >
                                                <option value={12}>12</option>
                                                <option value={24}>24</option>
                                                <option value={48}>48</option>
                                                <option value={96}>96</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Page Navigation Buttons */}
                                    <div className="flex items-center gap-1">
                                        {/* Prev Button */}
                                        <button
                                            onClick={() => handlePageChange(Math.max(1, activePage - 1))}
                                            disabled={activePage === 1}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 transition-all shadow-xs cursor-pointer"
                                            title="Previous Page"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        {/* Page Number Buttons */}
                                        {getPageNumbers(activePage, totalPages || 1).map((page, idx) => {
                                            if (page === '...') {
                                                return (
                                                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 font-bold select-none">
                                                        ...
                                                    </span>
                                                )
                                            }
                                            const isCurrent = page === activePage
                                            return (
                                                <button
                                                    key={`page-${page}`}
                                                    onClick={() => handlePageChange(Number(page))}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${isCurrent
                                                        ? 'bg-blue-600 border border-blue-600 text-white shadow-blue-200'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        })}

                                        {/* Next Button */}
                                        <button
                                            onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
                                            disabled={activePage >= totalPages || totalPages === 0}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 transition-all shadow-xs cursor-pointer"
                                            title="Next Page"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modals */}
                        {
                            showRegister && (
                                <RegisterModal
                                    tenantId={tenantId}
                                    quota={quota}
                                    onClose={() => setShowRegister(false)}
                                    onSuccess={() => fetchData(tenantId)}
                                />
                            )
                        }
                        {
                            showUnregister && (
                                <UnregisterModal
                                    tenantId={tenantId}
                                    asset={showUnregister}
                                    onClose={() => setShowUnregister(null)}
                                    onSuccess={() => fetchData(tenantId)}
                                />
                            )
                        }
                        {
                            showCredentials && (
                                <CredentialsModal
                                    tenantId={tenantId}
                                    asset={showCredentials}
                                    onClose={() => setShowCredentials(null)}
                                />
                            )
                        }
                        {
                            showBulkImport && (
                                <BulkImportModal
                                    tenantId={tenantId}
                                    onClose={() => setShowBulkImport(false)}
                                    onSuccess={() => fetchData(tenantId)}
                                />
                            )
                        }
                        {
                            showActivation && (
                                <ActivationModal
                                    tenantId={tenantId}
                                    asset={showActivation}
                                    onClose={() => setShowActivation(null)}
                                />
                            )
                        }
                        {
                            showCreateFolder.isOpen && (
                                <CreateFolderModal
                                    tenantId={tenantId}
                                    parentId={showCreateFolder.parentId}
                                    onClose={() => setShowCreateFolder({ isOpen: false, parentId: null })}
                                    onSuccess={() => fetchData(tenantId)}
                                />
                            )
                        }

                        {/* Click-away for context menu */}
                        {
                            contextMenu && (
                                <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
                            )
                        }
                    </div>
                </div>

                {/* Asset Detail Panel (slides in from right) */}
                <AssetDetailPanel
                    asset={selectedAsset}
                    tenantId={tenantId}
                    onClose={() => setSelectedAsset(null)}
                    basePath={base}
                />
            </div>
        </div>
    )
}
