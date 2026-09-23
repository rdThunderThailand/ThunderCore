'use client'

import { getMemberships } from '@/features/platform-tenants/management/[id]/members/actions'
import { Membership } from '@/types/members'
import { Loader2, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const APP_ROLES = ['Viewer', 'Developer', 'Admin', 'Owner'] as const
type AppRole = (typeof APP_ROLES)[number]

interface InviteMemberModalProps {
    tenantId: string
    existingMemberIds: string[]
    isSubmitting: boolean
    onClose: () => void
    onInvite: (memberId: string, role: AppRole) => void
}

// Parent only mounts this while the modal is open (see ApplicationManagementidMembersClient),
// so a fresh mount is enough to reset state — no isOpen prop or reset-on-close effect needed.
export function InviteMemberModal({
    tenantId,
    existingMemberIds,
    isSubmitting,
    onClose,
    onInvite,
}: InviteMemberModalProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Membership[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selected, setSelected] = useState<Membership | null>(null)
    const [role, setRole] = useState<AppRole>('Viewer')

    useEffect(() => {
        if (selected) return
        const term = query.trim()
        if (!term) {
            setResults([])
            setIsSearching(false)
            return
        }
        const timer = setTimeout(async () => {
            setIsSearching(true)
            try {
                const res = await getMemberships(tenantId, { search: term })
                setResults(res.data.filter((m) => !existingMemberIds.includes(m.id)))
            } finally {
                setIsSearching(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query, selected, tenantId, existingMemberIds])

    const handleInvite = () => {
        if (!selected) return
        onInvite(selected.id, role)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-4 text-lg font-semibold">Invite member</h3>

                <div className="space-y-4">
                    <div className="text-sm">
                        <span className="mb-1 block text-slate-600">Tenant member</span>
                        {selected ? (
                            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                <div>
                                    <p className="font-medium text-slate-900">{selected.user?.full_name}</p>
                                    <p className="text-xs text-slate-500">{selected.user?.email}</p>
                                </div>
                                <button onClick={() => setSelected(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Type a name or email to search..."
                                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
                                />
                                {(isSearching || results.length > 0) && (
                                    <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                                        {isSearching ? (
                                            <div className="flex items-center justify-center py-3">
                                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                            </div>
                                        ) : (
                                            results.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => { setSelected(m); setResults([]) }}
                                                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50"
                                                >
                                                    <span className="font-medium text-slate-900">{m.user?.full_name}</span>
                                                    <span className="text-xs text-slate-500">{m.user?.email}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                                {!isSearching && query.trim() && results.length === 0 && (
                                    <p className="mt-1 text-xs text-slate-500">No matching tenant members.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Role</span>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as AppRole)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            {APP_ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={!selected || isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Send Invitation
                    </button>
                </div>
            </div>
        </div>
    )
}
