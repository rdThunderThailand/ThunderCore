'use client'

import { Profile } from '@/types/dashboard'
import { ChevronLeft, ChevronRight, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteUser } from '@/lib/users'

interface UsersClientProps {
    initialUsers: Profile[]
    userRole: string
}

export function UsersClient({ initialUsers }: UsersClientProps) {
    const router = useRouter()
    const [users, setUsers] = useState<Profile[]>(initialUsers)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

    // Handle Search click
    const handleSearch = () => {
        setSearchQuery(searchTerm)
        setCurrentPage(1)
    }

    // Handle Enter key on search input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // Filter users
    const filteredUsers = users.filter((user) => {
        const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Anonymous User'
        const matchesQuery =
            displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesQuery
    })

    // Pagination setup
    const itemsPerPage = 8
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

    // Checkbox toggles
    const toggleSelectAll = () => {
        if (paginatedUsers.length === 0) return

        const allPaginatedSelected = paginatedUsers.every(user => selectedUserIds.includes(user.id))
        if (allPaginatedSelected) {
            // Unselect all on the current page
            const paginatedIds = paginatedUsers.map(u => u.id)
            setSelectedUserIds(selectedUserIds.filter(id => !paginatedIds.includes(id)))
        } else {
            // Select all on the current page
            const paginatedIds = paginatedUsers.map(u => u.id)
            const newSelection = Array.from(new Set([...selectedUserIds, ...paginatedIds]))
            setSelectedUserIds(newSelection)
        }
    }

    const toggleSelectUser = (id: string) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter(userId => userId !== id))
        } else {
            setSelectedUserIds([...selectedUserIds, id])
        }
    }

    // Single Delete
    const handleDelete = async (id: string, nameOrEmail: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete user "${nameOrEmail}"?`)
        if (!confirmed) return

        try {
            await deleteUser(id)
            setUsers(users.filter(u => u.id !== id))
            setSelectedUserIds(selectedUserIds.filter(userId => userId !== id))
            toast.success(`User "${nameOrEmail}" deleted successfully.`)
        } catch (error) {
            const err = error as Error
            toast.error(err.message || 'Failed to delete user.')
        }
    }

    // Bulk Delete
    const handleBulkDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete ${selectedUserIds.length} selected users?`)
        if (!confirmed) return

        try {
            await Promise.all(selectedUserIds.map(id => deleteUser(id)))
            setUsers(users.filter(u => !selectedUserIds.includes(u.id)))
            setSelectedUserIds([])
            toast.success('Selected users deleted successfully.')
        } catch (error) {
            const err = error as Error
            toast.error(err.message || 'Failed to delete users.')
        }
    }

    return (
        <div className="min-h-screen bg-[#F0F4F8] pb-24 lg:pb-0">
            <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8 animate-in fade-in duration-500">
                {/* Header title
                <div className="flex justify-between items-center">
                    <h1 className="text-[28px] font-bold text-indigo-950 leading-tight tracking-wide">
                        Users
                    </h1>
                </div> */}

                {/* Main Content Card */}
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-4 lg:p-6 min-h-[600px] flex flex-col">

                    {/* Search & Invite Actions */}
                    <div className="flex flex-row items-center justify-between gap-3 mb-6">
                        <div className="flex flex-1 max-w-md gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-blue-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors border-solid shrink-0"
                            >
                                Search
                            </button>
                        </div>

                        {/* Invite User Button */}
                        <button
                            onClick={() => toast.info('Invite User modal is not implemented yet.')}
                            className="px-4 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Invite User</span>
                        </button>
                    </div>

                    {/* Bulk Delete option */}
                    {selectedUserIds.length > 0 && (
                        <div className="mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-50 text-red-600 font-semibold text-xs rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete Selected ({selectedUserIds.length})
                            </button>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="flex-1 overflow-x-auto -mx-4 lg:-mx-0">
                        <table className="w-full min-w-[600px] lg:min-w-0">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-3 px-4 text-left w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                                            checked={paginatedUsers.length > 0 && paginatedUsers.every(user => selectedUserIds.includes(user.id))}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide w-24">IMAGE</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide">NAME</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide w-48">ROLE</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide w-36">STATUS</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-900 uppercase tracking-wide w-24">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedUsers.map((user) => {
                                        const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Anonymous User'
                                        const isSelected = selectedUserIds.includes(user.id)
                                        const firstLetter = user.email ? user.email.charAt(0).toUpperCase() : ''
                                        const roleStr = (user.role as string) || ''
                                        const isSuperAdminUser = roleStr === 'super_admin' || roleStr === 'company_admin'
                                        const isAdminUser = roleStr === 'admin' || roleStr === 'Admin'

                                        return (
                                            <tr
                                                key={user.id}
                                                onClick={() => router.push(`/settings?user=${user.id}`)}
                                                className={`group transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50/50'}`}
                                            >
                                                {/* Checkbox cell */}
                                                <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectUser(user.id)}
                                                    />
                                                </td>

                                                {/* IMAGE cell */}
                                                <td className="py-4 px-4">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold border border-blue-200">
                                                        {firstLetter}
                                                    </div>
                                                </td>

                                                {/* NAME cell */}
                                                <td className="py-4 px-4">
                                                    <span className="text-sm font-medium text-slate-700 block truncate max-w-[200px] sm:max-w-none">
                                                        {displayName}
                                                    </span>
                                                </td>

                                                {/* ROLE cell */}
                                                <td className="py-4 px-4">
                                                    {isSuperAdminUser ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-green-50 border border-green-200 text-green-700">
                                                            Super Admin
                                                        </span>
                                                    ) : isAdminUser ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600">
                                                            User
                                                        </span>
                                                    )}
                                                </td>

                                                {/* STATUS cell */}
                                                <td className="py-4 px-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-green-50 border border-green-200 text-green-700">
                                                        Joined
                                                    </span>
                                                </td>

                                                {/* ACTION cell */}
                                                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleDelete(user.id, displayName)}
                                                        className="text-sm font-medium text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="border-t border-slate-100 pt-6 mt-2 flex items-center justify-between">
                        <div className="text-sm text-slate-500 font-medium">
                            Page {currentPage} of {Math.max(1, totalPages)}
                        </div>
                        <div className="flex gap-2">
                            {/* Prev Page */}
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page numbers */}
                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === i + 1
                                            ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold'
                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                            } font-medium text-sm transition-all cursor-pointer`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Next Page */}
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
