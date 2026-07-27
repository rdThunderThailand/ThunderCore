'use client'

import { Asset } from '@/types/assets'
import {
    AlertCircle, ChevronLeft,
    ChevronRight, Hourglass, LayoutGrid, Loader2, Monitor, Rocket, ShieldCheck, XCircle
} from 'lucide-react'
import { useParams } from 'next/navigation'
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

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchData(tenantId)
        }, 300)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, currentPage, searchTerm, statusFilter, selectedFolderId, selectedV2AssetId, sortBy, activeTab, selectedTags])

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

    // Pagination Logic
    const totalPages = Math.ceil(totalCount / 12) // itemsPerPage is 12 in store

    // Helper to get folder path for breadcrumbs
    // const getFolderPath = ... (removed unused helper)

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
                                            {assets.map((asset, idx) => (
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
                                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        Page {currentPage} of {totalPages || 1} • {totalCount} items
                                    </p>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-blue-500 hover:border-blue-200 disabled:opacity-30 transition-all shadow-sm"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="flex items-center px-4 py-1.5 bg-white border border-blue-500 text-blue-500 font-black text-xs rounded-lg shadow-sm shadow-blue-100">
                                            {currentPage}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage >= totalPages || totalPages === 0}
                                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-white hover:text-blue-500 hover:border-blue-200 disabled:opacity-30 transition-all shadow-sm"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
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
