'use client'

import { Plus } from 'lucide-react'

interface MembersListHeaderProps {
    appName: string
    onInviteClick: () => void
}

export function MembersListHeader({ appName, onInviteClick }: MembersListHeaderProps) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">Manage users who have access to <span className="font-semibold text-blue-600">{appName}</span></h2>
            <button
                onClick={onInviteClick}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
            >
                <Plus className="h-4 w-4" /> Invite member
            </button>
        </div>
    )
}
