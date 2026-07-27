import { useAssetStore } from '@/store/useAssetStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Search, ChevronDown, Plus } from 'lucide-react'
import { AssetRegistryStatus } from '@/types/assets'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export const statusConfig: Record<AssetRegistryStatus, { label: string; color: string; dot: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50' },
    active: { label: 'Active', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
    unregistered: { label: 'Unregistered', color: 'text-slate-500', dot: 'bg-slate-400', bg: 'bg-slate-100' },
}

export const connectionConfig: Record<string, { label: string; color: string; dot: string; bg: string }> = {
    online: { label: 'Online', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50' },
    offline: { label: 'Offline', color: 'text-red-600', dot: 'bg-red-500', bg: 'bg-red-50' },
    busy: { label: 'Busy', color: 'text-amber-600', dot: 'bg-amber-500', bg: 'bg-amber-50' }
}

interface AssetsActionBarProps {
    setShowBulkImport: (v: boolean) => void
    setShowRegister: (v: boolean) => void
}

export function AssetsActionBar({
    setShowBulkImport,
    setShowRegister,
}: AssetsActionBarProps) {
    const {
        activeTab,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        sortBy, setSortBy,
        setCurrentPage,
        availableTags, selectedTags, toggleTagFilter, clearTagFilters
    } = useAssetStore()
    const role = useAuthStore((s) => s.role)
    const isSuperAdmin = role === 'super_admin'

    const router = useRouter()
    const pathname = usePathname()

    const resetPageUrlToOne = () => {
        setCurrentPage(1)
        const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
        p.set('page', '1')
        const newUrl = `${pathname}?${p.toString()}`
        if (typeof window !== 'undefined') {
            window.history.pushState(null, '', newUrl)
        }
        router.replace(newUrl, { scroll: false })
    }

    const handleSearchChange = (val: string) => {
        setSearchTerm(val)
        resetPageUrlToOne()
    }

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status)
        setShowFilterDropdown(false)
        resetPageUrlToOne()
    }

    const handleSortChange = (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => {
        setSortBy(sort)
        setShowSortDropdown(false)
        resetPageUrlToOne()
    }

    const handleToggleTag = (tag: string) => {
        toggleTagFilter(tag)
        resetPageUrlToOne()
    }

    const handleClearTags = () => {
        clearTagFilters()
        setShowTagDropdown(false)
        resetPageUrlToOne()
    }

    const currentFilterConfig = activeTab === 'player'
        ? connectionConfig
        : { pending: statusConfig.pending, unregistered: statusConfig.unregistered };

    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [showSortDropdown, setShowSortDropdown] = useState(false)
    const [showTagDropdown, setShowTagDropdown] = useState(false)

    return (
        <div className="p-4 flex flex-col xl:flex-row gap-4 items-center bg-white">
            <div className="flex flex-1 gap-2 w-full">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search by assets and device..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm placeholder:text-slate-300 font-medium focus:border-blue-300 transition-colors"
                    />
                </div>
                <button className="px-6 py-2 bg-blue-50/50 border border-blue-200 text-blue-500 font-bold rounded-lg hover:bg-blue-100 transition-all text-sm">
                    Search
                </button>
            </div>

            <div className="flex gap-2 w-full xl:w-auto shrink-0">
                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); setShowTagDropdown(false) }}
                        className={`px-4 py-2 border font-bold rounded-lg transition-all text-sm flex items-center gap-2 whitespace-nowrap ${statusFilter && statusFilter !== 'all' ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-blue-200 text-blue-500 hover:bg-blue-50'}`}
                    >
                        Filter by{statusFilter && statusFilter !== 'all' ? `: ${(currentFilterConfig as any)[statusFilter]?.label ?? statusFilter}` : ''} <ChevronDown className="w-4 h-4" />
                    </button>
                    {showFilterDropdown && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowFilterDropdown(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                                <button onClick={() => handleStatusFilterChange('all')} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                                    All Status
                                </button>
                                {Object.entries(currentFilterConfig).map(([key, config]) => (
                                    <button key={key} onClick={() => handleStatusFilterChange(key)} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); setShowTagDropdown(false) }}
                        className="px-4 py-2 bg-white border border-blue-200 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition-all text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        Sort by <ChevronDown className="w-4 h-4" />
                    </button>
                    {showSortDropdown && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 animate-in fade-in zoom-in-95 duration-100">
                                <button onClick={() => handleSortChange('newest')} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600">Newest</button>
                                <button onClick={() => handleSortChange('oldest')} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600">Oldest</button>
                                <button onClick={() => handleSortChange('name_asc')} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600">Name (A-Z)</button>
                                <button onClick={() => handleSortChange('name_desc')} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600">Name (Z-A)</button>
                            </div>
                        </>
                    )}
                </div>

                {/* Tag Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => { setShowTagDropdown(!showTagDropdown); setShowFilterDropdown(false); setShowSortDropdown(false) }}
                        className={`px-4 py-2 border font-bold rounded-lg transition-all text-sm flex items-center gap-2 whitespace-nowrap ${selectedTags.length > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-blue-200 text-blue-500 hover:bg-blue-50'}`}
                    >
                        Tag {selectedTags.length > 0 && `(${selectedTags.length})`} <ChevronDown className="w-4 h-4" />
                    </button>
                    {showTagDropdown && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setShowTagDropdown(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto">
                                <button onClick={() => handleClearTags()} className="w-full text-left px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-b border-slate-100">
                                    Clear All Tags
                                </button>
                                {availableTags.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-slate-400 font-medium text-center">No tags found</div>
                                ) : (
                                    availableTags.map(tag => {
                                        const parts = tag.split(':::')
                                        const tagName = parts[0]
                                        const tagColor = parts[1] || '#94a3b8' // Default to slate-400 if no color
                                        const isSelected = selectedTags.includes(tag)
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => handleToggleTag(tag)}
                                                className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${isSelected ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0 block" style={{ backgroundColor: tagColor }} />
                                                    <span className="truncate">{tagName}</span>
                                                </div>
                                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setShowBulkImport(true)}
                    className="hidden"
                >
                    <Plus className="w-4 h-4" /> Add All Register
                </button>

                {isSuperAdmin && (
                    <button
                        onClick={() => setShowRegister(true)}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add Device
                    </button>
                )}
            </div>
        </div>
    )
}
