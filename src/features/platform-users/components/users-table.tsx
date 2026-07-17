'use client'

import { useTranslation } from '@/i18n/context'
import { UsersTableProps } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SortIcon } from './sort-icon'
import { UserRow } from './user-row'

interface ExtendedUsersTableProps extends UsersTableProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    onDelete: (id: string) => void
}

export function UsersTable({
    profiles = [],
    currentUserId,
    sortConfig,
    onSort,
    onProfileUpdate,
    currentPage,
    totalPages,
    onPageChange,
    onDelete
}: ExtendedUsersTableProps) {
    const { t } = useTranslation()

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="p-4 w-10">
                                <input type="checkbox" className="rounded border-slate-300" />
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                {t('table.image')}
                            </th>
                            <th
                                onClick={() => onSort('first_name')}
                                className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide cursor-pointer hover:text-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {t('table.name')} <SortIcon column="first_name" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th
                                onClick={() => onSort('role')}
                                className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide cursor-pointer hover:text-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {t('table.role')} <SortIcon column="role" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">
                                {t('table.status')}
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-right">
                                {t('table.action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {profiles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                                    {t('users.noUsers')}
                                </td>
                            </tr>
                        ) : (
                            profiles.map((profile) => (
                                <UserRow
                                    key={profile.id}
                                    profile={profile}
                                    isSelf={profile.id === currentUserId}
                                    onProfileUpdate={onProfileUpdate}
                                    onDelete={onDelete}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <span>{t('common.page')} {currentPage} {t('common.of')} {totalPages}</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${currentPage === page
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100 font-bold'
                                    : 'hover:bg-slate-50 text-slate-500'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    })}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    )
}
