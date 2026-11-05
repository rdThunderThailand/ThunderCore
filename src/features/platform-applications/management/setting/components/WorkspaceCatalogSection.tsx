'use client'

import { Loader2, Trash2, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
    deleteApplicationWorkspace,
    getApplicationWorkspaces,
    importApplicationWorkspaces,
    updateApplicationWorkspace,
} from '../../../actions'
import { ApplicationWorkspace } from '@/types'
import { parseWorkspaceImport } from './workspace-import'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500'
const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6'

// Super admin: the workspaces this application offers (Core application_workspaces). Importing only
// adds them to the catalog — each tenant still starts with every workspace off, switched on in
// Tenant › Applications. Contract: Thunder_Core docs/api/application-workspaces.md.
export function WorkspaceCatalogSection({ appId }: { appId: string }) {
    const [workspaces, setWorkspaces] = useState<ApplicationWorkspace[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [importText, setImportText] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    const [busyId, setBusyId] = useState<string | null>(null)

    const parsed = useMemo(() => parseWorkspaceImport(importText), [importText])
    const invalid = parsed.filter((p) => p.error)

    useEffect(() => {
        getApplicationWorkspaces(appId)
            .then(setWorkspaces)
            .catch(() => toast.error('Failed to load workspaces'))
            .finally(() => setIsLoading(false))
    }, [appId])

    const handleImport = async () => {
        if (parsed.length === 0 || invalid.length > 0) return
        setIsImporting(true)
        try {
            setWorkspaces(await importApplicationWorkspaces(appId, parsed.map(({ code, name, sort_order }) => ({ code, name, sort_order }))))
            setImportText('')
            toast.success(`Imported ${parsed.length} workspace${parsed.length > 1 ? 's' : ''}`)
        } catch {
            toast.error('Failed to import workspaces')
        } finally {
            setIsImporting(false)
        }
    }

    // Not optimistic: the row shows a spinner until Core answers, then takes Core's row (or a toast).
    const handleStatus = async (workspace: ApplicationWorkspace) => {
        setBusyId(workspace.id)
        try {
            const next = workspace.status === 'active' ? 'inactive' : 'active'
            const updated = await updateApplicationWorkspace(appId, workspace.id, { status: next })
            setWorkspaces((list) => list.map((w) => (w.id === updated.id ? updated : w)))
        } catch {
            toast.error('Failed to update workspace')
        } finally {
            setBusyId(null)
        }
    }

    const handleDelete = async (workspace: ApplicationWorkspace) => {
        if (!window.confirm(`Delete "${workspace.name}"? Every tenant loses its switch for this workspace.`)) return
        setBusyId(workspace.id)
        try {
            await deleteApplicationWorkspace(appId, workspace.id)
            setWorkspaces((list) => list.filter((w) => w.id !== workspace.id))
            toast.success('Workspace deleted')
        } catch {
            toast.error('Failed to delete workspace')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <section className={cardClass}>
            <h2 className="text-lg font-semibold">Workspaces</h2>
            <p className="mb-4 text-sm text-slate-500">
                Workspaces this application offers. New workspaces start off for every tenant — switch them on in Tenant › Applications.
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                <div>
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Import (one per line: Name, or code | Name)</span>
                        <textarea
                            className={`${inputClass} font-mono`}
                            rows={6}
                            placeholder={'Media Workspace\nAsset Workspace\npeople | People Workspace'}
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                        />
                    </label>
                    {parsed.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs">
                            {parsed.map((p) => (
                                <li key={p.code} className={p.error ? 'text-red-600' : 'text-slate-500'}>
                                    <code className="rounded bg-slate-100 px-1">{p.code || '—'}</code> {p.name}
                                    {p.error && ` — line ${p.line}: ${p.error}`}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleImport}
                            disabled={isImporting || parsed.length === 0 || invalid.length > 0}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Import
                        </button>
                    </div>
                </div>

                <div>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : workspaces.length === 0 ? (
                        <p className="py-10 text-center text-sm text-slate-400">No workspaces yet. Import some to get started.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                            {workspaces.map((w) => (
                                <li key={w.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{w.name}</p>
                                        <code className="text-xs text-slate-400">{w.code}</code>
                                    </div>
                                    <button
                                        onClick={() => handleStatus(w)}
                                        disabled={busyId === w.id}
                                        title={w.status === 'active' ? 'Hide from every tenant' : 'Show to tenants that have it switched on'}
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${w.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}
                                    >
                                        {w.status === 'active' ? 'Active' : 'Inactive'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(w)}
                                        disabled={busyId === w.id}
                                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                        aria-label={`Delete ${w.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    )
}
