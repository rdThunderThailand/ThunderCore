'use client'

import { Pagination, Table, TableColumn, calcTotalPages, paginate } from '@/components/ui'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
    addApplicationAuthorization,
    getApplicationById,
    getApplicationTenants,
    getTenantsForSelect,
    removeApplicationAuthorization,
    updateApplication,
} from '../../actions'
import { Application, ApplicationTenantsAccess } from '@/types'

type TenantAccess = ApplicationTenantsAccess
type AccessStatus = 'Active' | 'Scheduled' | 'Expired'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500'
const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6'
const PAGE_SIZE = 8

const STATUS_STYLES: Record<AccessStatus, string> = {
    Active: 'bg-green-50 text-green-600',
    Scheduled: 'bg-amber-50 text-amber-600',
    Expired: 'bg-slate-100 text-slate-500',
}

// Access status is derived from the authorization window, not the tenant's own account status.
const getAccessStatus = (t: TenantAccess): AccessStatus => {
    const now = Date.now()
    if (t.ended_at && new Date(t.ended_at).getTime() < now) return 'Expired'
    if (new Date(t.started_at).getTime() > now) return 'Scheduled'
    return 'Active'
}

const stripScheme = (url: string) => url.replace(/^https?:\/\//, '')

export function ApplicationidSettingsClient({ appId }: { appId: string }) {
    const [app, setApp] = useState<Application | null>(null)
    const [tenants, setTenants] = useState<TenantAccess[]>([])
    const [form, setForm] = useState({ name: '', url: '', logo_url: '' })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [sortColumn, setSortColumn] = useState('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [page, setPage] = useState(1)

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                const [appData, access] = await Promise.all([
                    getApplicationById(appId),
                    getApplicationTenants(appId),
                ])
                if (appData) {
                    setApp(appData)
                    setForm({ name: appData.name, url: appData.url ?? '', logo_url: appData.logo_url ?? '' })
                }
                setTenants(access)
            } catch {
                toast.error('Failed to load application settings')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId])

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('Application name is required')
        setIsSaving(true)
        try {
            await updateApplication(appId, { name: form.name.trim(), url: form.url || null, logo_url: form.logo_url || null })
            toast.success('Settings saved')
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemove = async (tenant: TenantAccess) => {
        if (!window.confirm(`Remove ${tenant.tenant_name ?? tenant.tenant_id}'s access to this application?`)) return
        try {
            await removeApplicationAuthorization(appId, tenant.tenant_id)
            setTenants(await getApplicationTenants(appId))
            setSelectedIds((prev) => {
                const next = new Set(prev)
                next.delete(tenant.id)
                return next
            })
            toast.success('Access removed')
        } catch (err) {
            toast.error((err as Error).message)
        }
    }

    const handleSort = (column: string) => {
        if (column === sortColumn) setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
        else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const sortedTenants = useMemo(() => {
        const compare = (a: TenantAccess, b: TenantAccess) => {
            switch (sortColumn) {
                case 'status':
                    return getAccessStatus(a).localeCompare(getAccessStatus(b))
                case 'starts_at':
                    return a.started_at.localeCompare(b.started_at)
                case 'ends_at':
                    return (a.ended_at ?? '').localeCompare(b.ended_at ?? '')
                default:
                    return (a.tenant_name ?? '').localeCompare(b.tenant_name ?? '')
            }
        }
        const sorted = [...tenants].sort(compare)
        return sortDirection === 'asc' ? sorted : sorted.reverse()
    }, [tenants, sortColumn, sortDirection])

    const totalPages = calcTotalPages(sortedTenants.length, PAGE_SIZE)
    const currentPage = Math.min(page, totalPages)
    const pageItems = paginate(sortedTenants, currentPage, PAGE_SIZE)

    const columns: TableColumn<TenantAccess>[] = [
        { key: 'avatar', header: 'Image', width: '64px', render: (t) => <TenantAvatar name={t.tenant_name ?? t.tenant_id} /> },
        { key: 'name', header: 'Tenant', sortable: true, render: (t) => t.tenant_name ?? t.tenant_id },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (t) => {
                const status = getAccessStatus(t)
                return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>{status}</span>
            },
        },
        {
            key: 'starts_at',
            header: 'Started At',
            sortable: true,
            render: (t) => new Date(t.started_at).toLocaleDateString(),
        },
        {
            key: 'ends_at',
            header: 'Expired At',
            sortable: true,
            render: (t) => (t.ended_at ? new Date(t.ended_at).toLocaleDateString() : '—'),
        },
        {
            key: 'action',
            header: '',
            align: 'right',
            render: (t) => (
                <button onClick={() => handleRemove(t)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label={`Remove ${t.tenant_name ?? t.tenant_id}`}>
                    <Trash2 className="h-4 w-4" />
                </button>
            ),
        },
    ]

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!app) return <div className="p-8 text-sm text-slate-500">Application not found.</div>

    return (
        <div className="space-y-6 p-8">
            <section className={cardClass}>
                <h2 className="text-lg font-semibold">Application Settings</h2>
                <p className="mb-4 text-sm text-slate-500">Update your application details and information.</p>

                <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex shrink-0 flex-col items-center gap-2">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                            {form.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.logo_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-2xl font-semibold text-slate-400">{form.name.charAt(0).toUpperCase() || '?'}</span>
                            )}
                        </div>
                        <span className="text-center text-xs text-slate-400">Recommended: 400x400px</span>
                    </div>

                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                        <label className="text-sm">
                            <span className="mb-1 block text-slate-600">Application Name</span>
                            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </label>
                        <label className="text-sm">
                            <span className="mb-1 block text-slate-600">Application URL</span>
                            <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 focus-within:border-blue-500">
                                <span className="border-r border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">https://</span>
                                <input
                                    className="w-full px-3 py-2 text-sm outline-none"
                                    value={stripScheme(form.url)}
                                    onChange={(e) => {
                                        const path = e.target.value
                                        setForm({ ...form, url: path ? `https://${path}` : '' })
                                    }}
                                />
                            </div>
                        </label>
                        <label className="text-sm">
                            <span className="mb-1 block text-slate-600">Logo URL</span>
                            <input className={inputClass} placeholder='Logo URL' value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
                        </label>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                    </button>
                </div>
            </section>

            <section className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Tenants</h2>
                        <p className="text-sm text-slate-500">A list of Tenants using this application</p>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" /> Add Tenant
                    </button>
                </div>

                <Table
                    data={pageItems}
                    columns={columns}
                    keyExtractor={(t) => t.id}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    emptyMessage="No Data"
                />

                <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} className="mt-2" />
            </section>

            {isAddOpen && (
                <AddTenantModal
                    appId={appId}
                    existingIds={tenants.map((t) => t.tenant_id)}
                    onClose={() => setIsAddOpen(false)}
                    onAdded={async () => {
                        setIsAddOpen(false)
                        setTenants(await getApplicationTenants(appId))
                    }}
                />
            )}
        </div>
    )
}

function TenantAvatar({ name }: { name: string }) {
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
            {name.charAt(0).toUpperCase()}
        </div>
    )
}

function AddTenantModal({
    appId,
    existingIds,
    onClose,
    onAdded,
}: {
    appId: string
    existingIds: string[]
    onClose: () => void
    onAdded: () => void
}) {
    const [options, setOptions] = useState<Array<{ id: string; name: string }>>([])
    const [tenantId, setTenantId] = useState('')
    const [range, setRange] = useState({ start: '', end: '' })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        getTenantsForSelect()
            .then((all) => {
                const available = all.filter((o) => !existingIds.includes(o.id))
                setOptions(available)
                setTenantId(available[0]?.id ?? '')
            })
            .catch(() => toast.error('Failed to load tenants'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSave = async () => {
        if (!tenantId) return
        setIsSaving(true)
        try {
            await addApplicationAuthorization({
                appId,
                tenantId,
                startsAt: range.start ? new Date(range.start).toISOString() : undefined,
                endsAt: range.end ? new Date(range.end).toISOString() : undefined,
            })
            toast.success('Tenant added')
            onAdded()
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div className={`${cardClass} w-full max-w-md`} onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-4 text-lg font-semibold">Add Tenant access</h3>
                <label className="text-sm">
                    <span className="mb-1 block text-slate-600">Tenant</span>
                    <select className={inputClass} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                        {options.length === 0 && <option value="">No Tenants available</option>}
                        {options.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </label>
                {/* ponytail: native date inputs — swap for a picker only if the design demands one */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <label>
                        <span className="mb-1 block text-slate-600">Starts</span>
                        <input className={inputClass} type="date" value={range.start} onChange={(e) => setRange({ ...range, start: e.target.value })} />
                    </label>
                    <label>
                        <span className="mb-1 block text-slate-600">Ends</span>
                        <input className={inputClass} type="date" min={range.start || undefined} value={range.end} onChange={(e) => setRange({ ...range, end: e.target.value })} />
                    </label>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !tenantId}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}
