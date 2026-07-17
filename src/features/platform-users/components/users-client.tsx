'use client'

import { useTranslation } from '@/i18n/context'
import { Profile, UsersClientProps } from '@/types'
import { Plus, Search } from 'lucide-react'
import { useEffect, useRef, useState, useDeferredValue } from 'react'
import { createUser, getProfiles } from '../actions'
import { UserModal } from './user-modal'
import { UsersTable } from './users-table'

const ITEMS_PER_PAGE = 8

export function UsersClient({ initialProfiles, totalCount: initialTotalCount, currentUserId }: UsersClientProps) {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
    const [totalCount, setTotalCount] = useState(initialTotalCount)
    const [search, setSearch] = useState('')
    const [sortConfig, setSortConfig] = useState<{ key: keyof Profile, direction: 'asc' | 'desc' } | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const { t } = useTranslation()

    const handleSort = (key: keyof Profile) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const handleProfileUpdate = (id: string, updates: Partial<Profile>) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }

    const handleCreateUser = async (data: { email: string, role: string }) => {
        setIsLoading(true)
        setError(null)
        try {
            await createUser(data)
            setIsModalOpen(false)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = (id: string) => {
        setProfiles(prev => prev.filter(p => p.id !== id))
        fetchProfilesData() // Refetch to maintain page size
    }

    const fetchProfilesData = async () => {
        setIsLoading(true)
        try {
            const res = await getProfiles({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search,
                sortBy: sortConfig?.key,
                sortDirection: sortConfig?.direction
            })
            setProfiles(res.data)
            setTotalCount(res.count)
        } catch (err) {
            console.error('Failed to fetch profiles:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const isMounted = useRef(false)
    const deferredSearch = useDeferredValue(search)
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
            return
        }
        const timeout = setTimeout(() => {
            fetchProfilesData()
        }, 300)
        return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, deferredSearch, sortConfig])

    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
    const paginatedProfiles = profiles

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Title */}
            <h1 className="text-3xl font-bold text-slate-900">{t('users.title')}</h1>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Action Bar */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('users.searchPlaceholder')}
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full md:w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>
                        <button className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">
                            {t('common.search')}
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#0F53FF] text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 text-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        {t('modal.inviteUser')}
                    </button>
                </div>

                {/* Table */}
                <UsersTable
                    profiles={paginatedProfiles}
                    currentUserId={currentUserId}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onProfileUpdate={handleProfileUpdate}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modal */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateUser}
                isLoading={isLoading}
                error={error}
            />
        </div>
    )
}
