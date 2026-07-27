'use client'

import { calcTotalPages, paginate, Pagination } from '@/components/ui'
import { AppMember } from '@/types/applications'
import { MoreVertical, Search, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'

const PAGE_SIZE = 8

interface MembersTableProps {
    members: AppMember[]
    searchTerm: string
    setSearchTerm: (term: string) => void
    activeDropdown: string | null
    setActiveDropdown: (id: string | null) => void
    onRemoveMember: (id: string, membershipId: string) => void
}

export function MembersTable({
    members,
    searchTerm,
    setSearchTerm,
    activeDropdown,
    setActiveDropdown,
    onRemoveMember
}: MembersTableProps) {
    const [page, setPage] = useState(1)

    // reset page when search changes
    const handleSearch = (v: string) => {
        setSearchTerm(v)
        setPage(1)
    }

    const pages = calcTotalPages(members.length, PAGE_SIZE)
    const pageItems = paginate(members, page, PAGE_SIZE)

    return (
        <div className="flex flex-col min-h-0 flex-1">
            <div className="mb-4 relative max-w-md shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {members.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-500">
                        {searchTerm ? 'No members match your search.' : 'Invite team members to collaborate.'}
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-slate-100 text-left text-slate-500">
                                <th className="py-2 font-medium">Member</th>
                                <th className="py-2 font-medium">Role</th>
                                <th className="py-2 font-medium">Status</th>
                                <th className="py-2 font-medium text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map((member) => (
                                <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{member.name}</p>
                                                <p className="text-xs text-slate-500">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 text-slate-600">{member.role}</td>
                                    <td className="py-3 text-slate-600">{member.status}</td>
                                    <td className="py-3 text-right">
                                        <div className="relative inline-block text-left">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                            {activeDropdown === member.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                                        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                            <Shield className="h-4 w-4" />
                                                            Change Role
                                                        </button>
                                                        <div className="my-1 border-t border-slate-100" />
                                                        <button
                                                            onClick={() => onRemoveMember(member.id, member.membershipId)}
                                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Pagination page={page} totalPages={pages} onChange={setPage} className="shrink-0 mt-2" />
        </div>
    )
}
