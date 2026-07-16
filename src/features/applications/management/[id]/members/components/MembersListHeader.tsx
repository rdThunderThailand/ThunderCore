'use client'

import { Plus } from 'lucide-react'

interface MembersListHeaderProps {
    appName: string
    onInviteClick: () => void
}

export function MembersListHeader({ appName, onInviteClick }: MembersListHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Application Members</h1>
                <p className="text-slate-500 font-bold mt-1">
                    Manage users who have access to <span className="text-violet-600">{appName}</span>
                </p>
            </div>
            <button
                onClick={onInviteClick}
                className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                Invite Member
            </button>
        </div>
    )
}
