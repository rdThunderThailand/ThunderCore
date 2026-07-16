'use client'

import { Mail, MoreVertical, Search, Shield, Trash2, Users } from 'lucide-react'

interface AppMember {
    id: string
    name: string
    email: string
    role: string
    status: 'Active' | 'Pending'
    tenantName?: string
}

interface MembersTableProps {
    members: AppMember[]
    searchTerm: string
    setSearchTerm: (term: string) => void
    activeDropdown: string | null
    setActiveDropdown: (id: string | null) => void
    onRemoveMember: (id: string) => void
}

export function MembersTable({
    members,
    searchTerm,
    setSearchTerm,
    activeDropdown,
    setActiveDropdown,
    onRemoveMember
}: MembersTableProps) {
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-100 outline-none transition-all font-bold"
                    />
                </div>
            </div>

            {members.length === 0 ? (
                <div className="p-20 text-center">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-900">No Members Found</h3>
                    <p className="text-slate-500 font-bold mt-2">
                        {searchTerm ? 'No members match your search.' : 'Invite team members to collaborate.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Member</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{member.name}</p>
                                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${member.role === 'Admin' ? 'bg-violet-50 text-violet-600' :
                                            member.role === 'Developer' ? 'bg-blue-50 text-blue-600' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="relative inline-block">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                                                className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            {activeDropdown === member.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-2">
                                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                                            <Shield className="w-4 h-4" />
                                                            Change Role
                                                        </button>
                                                        <div className="my-1 mx-2 border-t border-slate-100" />
                                                        <button
                                                            onClick={() => onRemoveMember(member.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                </div>
            )}
        </div>
    )
}
