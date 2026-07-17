'use client'

import { useAssetStore } from '@/store/useAssetStore'
import { useUIStore } from '@/store/useUIStore'
import {
    ChevronsRight, ChevronsLeft, Plus, ChevronDown,
    MoreHorizontal, Edit2, FolderInput, Settings, Trash2,
    Search, X, Tag
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { RenameFolderModal } from './rename-folder-modal'
import { MoveFolderModal } from './move-folder-modal'
import { DeleteFolderModal } from './delete-folder-modal'
import { DeleteAssetModal } from './delete-asset-modal'
import { EditAssetModal } from './edit-asset-modal'
import { useParams } from 'next/navigation'
import type { AssetWithDevices } from '@/types/asset-management'
import { Asset } from '@/types/assets'

// Tag color palette — cycles through these for visual variety
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Primary: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    Info: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
    Success: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    Warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    Danger: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
}

const DEFAULT_PALETTE = [
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
]

function getTagColor(tag: string, index: number) {
    return TAG_COLORS[tag] ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]
}

interface AssetsSidebarProps {
    setShowCreateFolder: (v: { isOpen: boolean; parentId: string | null }) => void
}

export function AssetsSidebar({ setShowCreateFolder }: AssetsSidebarProps) {
    const params = useParams()
    const tenantId = params.id as string

    const {
        folders,
        selectedFolderId, setSelectedFolderId,
        expandedFolders, toggleFolderExpanded,
        contextMenu, setContextMenu,
        v2Assets, selectedV2AssetId, setSelectedV2AssetId,
        availableTags, selectedTags, toggleTagFilter,
    } = useAssetStore()

    const { isLocalSidebarCollapsed: isSidebarCollapsed, setIsLocalSidebarCollapsed: setIsSidebarCollapsed } = useUIStore()

    const [searchValue, setSearchValue] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const [showTagSearch, setShowTagSearch] = useState(false)

    // Modal States
    const [renameModalData, setRenameModalData] = useState<{ isOpen: boolean, folderId: string, name: string }>({ isOpen: false, folderId: '', name: '' })
    const [moveModalData, setMoveModalData] = useState<{ isOpen: boolean, folderId: string, parentId: string | null, name: string }>({ isOpen: false, folderId: '', parentId: null, name: '' })
    const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean, folderId: string, name: string }>({ isOpen: false, folderId: '', name: '' })

    // Asset Modals (for V2 Assets in sidebar)
    const [editAssetModalData, setEditAssetModalData] = useState<{ isOpen: boolean, asset: Asset | null }>({ isOpen: false, asset: null })
    const [deleteAssetModalData, setDeleteAssetModalData] = useState<{ isOpen: boolean, asset: Asset | null }>({ isOpen: false, asset: null })

    // Close context menu on outside click
    const menuRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setContextMenu(null)
            }
        }
        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [contextMenu, setContextMenu])

    const handleContextMenu = (e: React.MouseEvent, type: 'root' | 'folder' | 'asset', folderId: string | null = null) => {
        e.preventDefault()
        e.stopPropagation()
        setContextMenu({ type, x: e.clientX, y: e.clientY, folderId })
    }

    // Filter v2Assets by search
    const filteredAssets = v2Assets.filter(a =>
        a.asset_name.toLowerCase().includes(searchValue.toLowerCase())
    )

    // Filter tags
    const filteredTags = availableTags.filter(t =>
        t.toLowerCase().includes(tagSearch.toLowerCase())
    )

    // ─── Folder tree renderer (kept for legacy folder data) ──────────────────
    const renderFolderTree = (parentId: string | null = null, depth: number = 0): React.ReactNode => {
        const children = folders.filter(f => f.parent_id === parentId)
        if (children.length === 0) return null
        return (
            <div className={`space-y-0.5 ${depth > 0 ? 'pl-5 mt-0.5' : ''}`}>
                {children.map(folder => {
                    const hasChildren = folders.some(f => f.parent_id === folder.id)
                    const isExpanded = expandedFolders[folder.id]
                    return (
                        <div key={folder.id}>
                            <div className="flex items-center group cursor-pointer hover:bg-slate-50 py-0.5 px-1 rounded transition-colors">
                                <div className="flex items-center gap-1 overflow-hidden flex-1" onClick={() => setSelectedFolderId(folder.id)}>
                                    {hasChildren ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleFolderExpanded(folder.id) }}
                                            className="p-0.5 text-slate-400 hover:text-slate-600 rounded shrink-0"
                                        >
                                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                        </button>
                                    ) : (
                                        <div className="w-4 h-4 shrink-0" />
                                    )}
                                    <span className={`text-xs px-1.5 py-0.5 rounded truncate transition-colors ${selectedFolderId === folder.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}>
                                        {folder.name}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleContextMenu(e, 'folder', folder.id)}
                                    className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 rounded hover:text-slate-600 transition-all shrink-0"
                                    title="More Options"
                                >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {isExpanded && renderFolderTree(folder.id, depth + 1)}
                        </div>
                    )
                })}
            </div>
        )
    }

    // ─── Collapsed State ─────────────────────────────────────────────────────
    if (isSidebarCollapsed) {
        return (
            <>
                <div className="bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-screen w-14 transition-all duration-300">
                    {/* Expand button */}
                    <div className="h-14 flex items-center justify-center border-b border-slate-200">
                        <button onClick={() => setIsSidebarCollapsed(false)} className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded transition-colors">
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Collapsed asset icons */}
                    <div className="flex flex-col items-center gap-2 py-4 px-2 overflow-y-auto flex-1">
                        {v2Assets.map(asset => (
                            <button
                                key={asset.asset_id}
                                onClick={() => setSelectedV2AssetId(asset.asset_id)}
                                title={asset.asset_name}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border
                                    ${selectedV2AssetId === asset.asset_id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                        : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                            >
                                {asset.asset_name.charAt(0).toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Modals + Context Menu */}
                {contextMenu && (
                    <ContextMenuPortal
                        menuRef={menuRef}
                        contextMenu={contextMenu}
                        folders={folders}
                        setContextMenu={setContextMenu}
                        setShowCreateFolder={setShowCreateFolder}
                        setRenameModalData={setRenameModalData}
                        setMoveModalData={setMoveModalData}
                        setDeleteModalData={setDeleteModalData}
                        v2Assets={v2Assets}
                        setEditAssetModalData={setEditAssetModalData}
                        setDeleteAssetModalData={setDeleteAssetModalData}
                    />
                )}
                <ModalGroup
                    tenantId={tenantId}
                    renameModalData={renameModalData}
                    setRenameModalData={setRenameModalData}
                    moveModalData={moveModalData}
                    setMoveModalData={setMoveModalData}
                    deleteModalData={deleteModalData}
                    setDeleteModalData={setDeleteModalData}
                    editAssetModalData={editAssetModalData}
                    setEditAssetModalData={setEditAssetModalData}
                    deleteAssetModalData={deleteAssetModalData}
                    setDeleteAssetModalData={setDeleteAssetModalData}
                />
            </>
        )
    }

    // ─── Expanded State ──────────────────────────────────────────────────────
    return (
        <>
            <div className="bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-screen w-72 transition-all duration-300">

                {/* ── Header ──────────────────────────────────────────── */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
                    <span className="text-sm font-bold text-slate-800">Folder</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => { }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Settings"
                        >
                            <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => { }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Search"
                        >
                            <Search className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setIsSidebarCollapsed(true)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Collapse"
                        >
                            <ChevronsLeft className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* ── Search Bar ──────────────────────────────────────── */}
                <div className="px-3 pt-3 pb-2 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search"
                            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                        />
                        {searchValue && (
                            <button
                                onClick={() => setSearchValue('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Asset / Folder Tree ──────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-3 pb-2">
                    {/* "All Devices" row */}
                    <div
                        onClick={() => { setSelectedV2AssetId(null); setSelectedFolderId(null) }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer mb-1 transition-all text-xs font-medium
                            ${selectedV2AssetId === null && selectedFolderId === null
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        <div className="w-3.5 h-3.5 shrink-0" />
                        <span>All Assets</span>
                    </div>

                    {/* V2 Assets list */}
                    {filteredAssets.length === 0 && searchValue === '' ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 mb-2">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0.5-5" />
                                <path d="M8 7h6" /><path d="M8 11h8" />
                            </svg>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">No Assets</p>
                        </div>
                    ) : filteredAssets.length === 0 && searchValue !== '' ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">No results</p>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {filteredAssets.map(asset => {
                                const isSelected = selectedV2AssetId === asset.asset_id
                                return (
                                    <div
                                        key={asset.asset_id}
                                        onClick={() => setSelectedV2AssetId(asset.asset_id)}
                                        className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all border
                                            ${isSelected
                                                ? 'bg-blue-600 border-blue-600 shadow-sm'
                                                : 'border-transparent hover:bg-slate-50'}`}
                                    >
                                        {/* Folder-like expand chevron placeholder */}
                                        <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                                            <ChevronDown className={`w-3 h-3 transition-transform ${isSelected ? 'text-blue-100 rotate-0' : 'text-slate-300 -rotate-90'}`} />
                                        </div>
                                        {/* Asset name + category */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                {asset.asset_name}
                                            </p>
                                        </div>
                                        {/* Context menu dot */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleContextMenu(e, 'asset', asset.asset_id) }}
                                            className={`p-0.5 opacity-0 group-hover:opacity-100 rounded transition-all shrink-0
                                                ${isSelected ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Legacy folder tree */}
                    {folders.length > 0 && (
                        <div className="mt-2 border-t border-slate-100 pt-2">
                            {renderFolderTree()}
                        </div>
                    )}
                </div>

                {/* ── Tag List ─────────────────────────────────────────── */}
                <div className="border-t border-slate-200 px-3 pt-3 pb-4 shrink-0">
                    {/* Tag List header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tag List</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => { }}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setShowTagSearch(!showTagSearch)}
                                className={`p-1 rounded transition-colors ${showTagSearch ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                title="Search tags"
                            >
                                <Search className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Tag search input */}
                    {showTagSearch && (
                        <div className="mb-2 relative">
                            <input
                                type="text"
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                placeholder="Search tags..."
                                className="w-full pl-2.5 pr-7 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
                                autoFocus
                            />
                            {tagSearch && (
                                <button onClick={() => setTagSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    {filteredTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {filteredTags.map((tag, idx) => {
                                const colors = getTagColor(tag, idx)
                                const isActive = selectedTags.includes(tag)
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTagFilter(tag)}
                                        className={`
                                            inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all
                                            ${isActive
                                                ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-offset-1 ring-current shadow-sm`
                                                : `${colors.bg} ${colors.text} ${colors.border} hover:brightness-95 opacity-80 hover:opacity-100`
                                            }
                                        `}
                                    >
                                        {tag}
                                    </button>
                                )
                            })}
                        </div>
                    ) : availableTags.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-2">No tags yet</p>
                    ) : (
                        <p className="text-[10px] text-slate-400 text-center py-2">No tags match</p>
                    )}

                    {/* Clear filters shortcut */}
                    {selectedTags.length > 0 && (
                        <button
                            onClick={() => useAssetStore.getState().clearTagFilters()}
                            className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear {selectedTags.length} filter{selectedTags.length > 1 ? 's' : ''}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Context Menu Portal ────────────────────────────────── */}
            {contextMenu && (
                <ContextMenuPortal
                    menuRef={menuRef}
                    contextMenu={contextMenu}
                    folders={folders}
                    setContextMenu={setContextMenu}
                    setShowCreateFolder={setShowCreateFolder}
                    setRenameModalData={setRenameModalData}
                    setMoveModalData={setMoveModalData}
                    setDeleteModalData={setDeleteModalData}
                    v2Assets={v2Assets}
                    setEditAssetModalData={setEditAssetModalData}
                    setDeleteAssetModalData={setDeleteAssetModalData}
                />
            )}

            {/* ── Modals ────────────────────────────────────────────── */}
            <ModalGroup
                tenantId={tenantId}
                renameModalData={renameModalData}
                setRenameModalData={setRenameModalData}
                moveModalData={moveModalData}
                setMoveModalData={setMoveModalData}
                deleteModalData={deleteModalData}
                setDeleteModalData={setDeleteModalData}
                editAssetModalData={editAssetModalData}
                setEditAssetModalData={setEditAssetModalData}
                deleteAssetModalData={deleteAssetModalData}
                setDeleteAssetModalData={setDeleteAssetModalData}
            />
        </>
    )
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components to reduce duplication between collapsed/expanded paths
// ──────────────────────────────────────────────────────────────────────────────

type ContextMenuPortalProps = {
    menuRef: React.RefObject<HTMLDivElement | null>
    contextMenu: { type: 'folder' | 'root' | 'asset' | null; x: number; y: number; folderId: string | null }
    folders: { id: string; name: string; parent_id: string | null }[]
    setContextMenu: (v: null) => void
    setShowCreateFolder: (v: { isOpen: boolean; parentId: string | null }) => void
    setRenameModalData: (v: { isOpen: boolean; folderId: string; name: string }) => void
    setMoveModalData: (v: { isOpen: boolean; folderId: string; parentId: string | null; name: string }) => void
    setDeleteModalData: (v: { isOpen: boolean; folderId: string; name: string }) => void
    v2Assets: AssetWithDevices[]
    setEditAssetModalData: (v: { isOpen: boolean; asset: Asset | null }) => void
    setDeleteAssetModalData: (v: { isOpen: boolean; asset: Asset | null }) => void
}

function ContextMenuPortal({
    menuRef, contextMenu, folders, setContextMenu,
    setShowCreateFolder, setRenameModalData, setMoveModalData, setDeleteModalData,
    v2Assets, setEditAssetModalData, setDeleteAssetModalData,
}: ContextMenuPortalProps) {
    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-sm animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <button
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold text-xs"
                onClick={() => {
                    setShowCreateFolder({ isOpen: true, parentId: contextMenu.folderId })
                    setContextMenu(null)
                }}
            >
                <Plus className="w-4 h-4 text-slate-400" /> New Folder
            </button>

            {contextMenu.type === 'folder' && (() => {
                const targetFolder = folders.find(f => f.id === contextMenu.folderId)
                if (!targetFolder) return null
                return (
                    <>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold text-xs"
                            onClick={() => {
                                setRenameModalData({ isOpen: true, folderId: targetFolder.id, name: targetFolder.name })
                                setContextMenu(null)
                            }}
                        >
                            <Edit2 className="w-4 h-4 text-slate-400" /> Rename
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold text-xs"
                            onClick={() => {
                                setMoveModalData({ isOpen: true, folderId: targetFolder.id, parentId: targetFolder.parent_id, name: targetFolder.name })
                                setContextMenu(null)
                            }}
                        >
                            <FolderInput className="w-4 h-4 text-slate-400" /> Move to
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold text-xs"
                            onClick={() => setContextMenu(null)}
                        >
                            <Settings className="w-4 h-4 text-slate-400" /> Setting
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold text-xs"
                            onClick={() => {
                                setDeleteModalData({ isOpen: true, folderId: targetFolder.id, name: targetFolder.name })
                                setContextMenu(null)
                            }}
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </>
                )
            })()}

            {contextMenu.type === 'asset' && (() => {
                const targetAsset = v2Assets.find(a => a.asset_id === contextMenu.folderId)
                if (!targetAsset) return null
                
                // Map AssetWithDevices into the standard Asset format expected by modals
                const mapToAsset = (a: AssetWithDevices): Asset => ({
                    id: a.asset_id,
                    name: a.asset_name,
                    device_name: a.asset_name,
                    tenant_id: a.tenant_id || '',
                    registry_status: 'active' as const,
                    status: 'Active',
                    created_at: a.created_at || new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    type: 'Device',
                    device_type: null,
                    last_active_user_id: null,
                    tags: [],
                    connection_status: 'offline' as const,
                    last_heartbeat_at: null,
                    unregistered_at: null,
                    data_retention: 'archive'
                }) as unknown as Asset

                return (
                    <>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold text-xs"
                            onClick={() => {
                                setEditAssetModalData({ isOpen: true, asset: mapToAsset(targetAsset) })
                                setContextMenu(null)
                            }}
                        >
                            <Edit2 className="w-4 h-4 text-slate-400" /> Rename
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold text-xs"
                            onClick={() => {
                                setDeleteAssetModalData({ isOpen: true, asset: mapToAsset(targetAsset) })
                                setContextMenu(null)
                            }}
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </>
                )
            })()}
        </div>
    )
}

type ModalGroupProps = {
    tenantId: string
    renameModalData: { isOpen: boolean; folderId: string; name: string }
    setRenameModalData: (v: { isOpen: boolean; folderId: string; name: string }) => void
    moveModalData: { isOpen: boolean; folderId: string; parentId: string | null; name: string }
    setMoveModalData: (v: { isOpen: boolean; folderId: string; parentId: string | null; name: string }) => void
    deleteModalData: { isOpen: boolean; folderId: string; name: string }
    setDeleteModalData: (v: { isOpen: boolean; folderId: string; name: string }) => void
    editAssetModalData: { isOpen: boolean; asset: Asset | null }
    setEditAssetModalData: (v: { isOpen: boolean; asset: Asset | null }) => void
    deleteAssetModalData: { isOpen: boolean; asset: Asset | null }
    setDeleteAssetModalData: (v: { isOpen: boolean; asset: Asset | null }) => void
}

function ModalGroup({ 
    tenantId, renameModalData, setRenameModalData, moveModalData, setMoveModalData, 
    deleteModalData, setDeleteModalData,
    editAssetModalData, setEditAssetModalData, deleteAssetModalData, setDeleteAssetModalData
}: ModalGroupProps) {
    return (
        <>
            <RenameFolderModal
                isOpen={renameModalData.isOpen}
                onClose={() => setRenameModalData({ ...renameModalData, isOpen: false })}
                tenantId={tenantId}
                folderId={renameModalData.folderId}
                initialName={renameModalData.name}
            />
            <MoveFolderModal
                isOpen={moveModalData.isOpen}
                onClose={() => setMoveModalData({ ...moveModalData, isOpen: false })}
                tenantId={tenantId}
                folderId={moveModalData.folderId}
                currentParentId={moveModalData.parentId}
                folderName={moveModalData.name}
            />
            <DeleteFolderModal
                isOpen={deleteModalData.isOpen}
                onClose={() => setDeleteModalData({ ...deleteModalData, isOpen: false })}
                tenantId={tenantId}
                folderId={deleteModalData.folderId}
                folderName={deleteModalData.name}
            />

            {editAssetModalData.asset && (
                <EditAssetModal
                    isOpen={editAssetModalData.isOpen}
                    onClose={() => setEditAssetModalData({ ...editAssetModalData, isOpen: false })}
                    tenantId={tenantId}
                    asset={editAssetModalData.asset}
                />
            )}

            {deleteAssetModalData.asset && (
                <DeleteAssetModal
                    isOpen={deleteAssetModalData.isOpen}
                    onClose={() => setDeleteAssetModalData({ ...deleteAssetModalData, isOpen: false })}
                    tenantId={tenantId}
                    asset={deleteAssetModalData.asset}
                    onSuccess={() => {}} // Store will likely need re-fetch triggering or optimistic UI
                />
            )}
        </>
    )
}
