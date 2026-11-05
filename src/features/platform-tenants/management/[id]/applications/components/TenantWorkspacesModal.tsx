'use client'

import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getTenantApplicationWorkspaces, setTenantApplicationWorkspace } from '../actions'
import { TenantApplicationWorkspaces } from '@/types'

// Super admin: switch each of an application's workspaces on or off for one tenant. The application
// reads the result from Core's /session (enabled_workspaces). Catalog: Application settings › Workspaces.
export function TenantWorkspacesModal({
    tenantId,
    appId,
    appName,
    onClose,
}: {
    tenantId: string
    appId: string
    appName: string
    onClose: () => void
}) {
    const [data, setData] = useState<TenantApplicationWorkspaces | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [busyId, setBusyId] = useState<string | null>(null)

    useEffect(() => {
        getTenantApplicationWorkspaces(tenantId, appId)
            .then(setData)
            .catch(() => toast.error('Failed to load workspaces'))
            .finally(() => setIsLoading(false))
    }, [tenantId, appId])

    // Optimistic: the switch flips at once; on failure it rolls back to the previous value + toast.
    const handleToggle = async (workspaceId: string, isActive: boolean) => {
        const setActive = (value: boolean) =>
            setData((d) => d && {
                ...d,
                workspaces: d.workspaces.map((w) => (w.id === workspaceId ? { ...w, is_active: value, enabled: value && w.status === 'active' } : w)),
            })
        setBusyId(workspaceId)
        setActive(isActive)
        try {
            await setTenantApplicationWorkspace(tenantId, appId, workspaceId, isActive)
        } catch {
            setActive(!isActive)
            toast.error('Failed to update workspace')
        } finally {
            setBusyId(null)
        }
    }

    const isOwner = data?.access === 'owner'
    const hasNoAccess = data !== null && data.access === null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-1 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Workspaces · {appName}</h2>
                    <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100" aria-label="Close">
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>
                <p className="mb-4 text-sm text-slate-500">Choose which workspaces this tenant can open.</p>

                {isOwner && (
                    <p className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                        This tenant owns the application and sees every workspace — these switches have no effect for it.
                    </p>
                )}
                {hasNoAccess && (
                    <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        This tenant has no access to the application. Grant access first in the application&apos;s settings.
                    </p>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                ) : !data || data.workspaces.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-400">
                        No workspaces in this application yet. Import them in Application settings › Workspaces.
                    </p>
                ) : (
                    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {data.workspaces.map((w) => (
                            <li key={w.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{w.name}</p>
                                    <p className="text-xs text-slate-400">
                                        <code>{w.code}</code>
                                        {w.status === 'inactive' && ' · inactive for every tenant'}
                                    </p>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={w.is_active}
                                    aria-label={`${w.name} active`}
                                    onClick={() => handleToggle(w.id, !w.is_active)}
                                    disabled={busyId === w.id || isOwner || hasNoAccess}
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${w.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${w.is_active ? 'left-[22px]' : 'left-0.5'}`} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
