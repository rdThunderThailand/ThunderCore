'use client'

import { useApplicationStore } from '@/store/useApplicationStore'
import { AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
// import { ApiKeySection } from './components/ApiKeySection'

type TenantAccess = { id: string; name: string; starts_at: string | null; ends_at: string | null }

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500'
const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6'

export function ApplicationManagementidSettingsClient({ appId }: { appId: string }) {
    const router = useRouter()
    const {
        currentApp: app, applicationTenants, isAppLoading, isTenantsLoading,
        fetchApplicationById, fetchApplicationTenants, updateApplicationDetail,
        deleteApplicationById, removeTenantAuthorization,
    } = useApplicationStore()
    const isLoading = isAppLoading || isTenantsLoading
    const tenants: TenantAccess[] = applicationTenants.map((t) => ({
        id: t.tenant_id, name: t.tenant_name ?? t.tenant_id, starts_at: t.started_at, ends_at: t.ended_at,
    }))
    const [form, setForm] = useState({ name: '', url: '', logo_url: '' })
    const [isSaving, setIsSaving] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const appData = await fetchApplicationById(appId)
                await fetchApplicationTenants(appId)
                if (appData) {
                    setForm({ name: appData.name, url: appData.url ?? '', logo_url: appData.logo_url ?? '' })
                }
            } catch {
                toast.error('Failed to load application settings')
            }
        }
        load()
    }, [appId, fetchApplicationById, fetchApplicationTenants])

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('Application name is required')
        setIsSaving(true)
        try {
            await updateApplicationDetail(appId, { name: form.name.trim(), url: form.url, logo_url: form.logo_url || null })
            toast.success('Settings saved')
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteApplication = async () => {
        setIsDeleting(true)
        try {
            await deleteApplicationById(appId)
            toast.success('Application deleted')
            router.push('/applications')
        } catch (err) {
            toast.error((err as Error).message)
            setIsDeleting(false)
        }
    }

    const handleRemove = async (tenant: TenantAccess) => {
        if (!window.confirm(`Remove ${tenant.name}'s access to this application?`)) return
        try {
            await removeTenantAuthorization(appId, tenant.id)
            toast.success('Access removed')
        } catch (err) {
            toast.error((err as Error).message)
        }
    }

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
                <h2 className="mb-4 text-lg font-semibold">General</h2>
                <div className="flex gap-5 w-full">
                    <div className="flex shrink-0 flex-col items-center gap-2">
                        <div className="flex h-30 w-30 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                            {form.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.logo_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-2xl font-semibold text-slate-400">{form.name.charAt(0).toUpperCase() || '?'}</span>
                            )}
                        </div>
                        <span className="text-center text-xs text-slate-400">Recommended: 400x400px</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 w-full">
                        <label className="text-sm">
                            <span className="mb-1 block text-slate-600">Name</span>
                            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </label>
                        <label className="text-sm">
                            <span className="mb-1 block text-slate-600">URL</span>
                            <input className={inputClass} type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                        </label>
                        <label className="text-sm sm:col-span-2">
                            <span className="mb-1 block text-slate-600">Logo URL</span>
                            <input className={inputClass} type="url" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
                        </label>
                    </div>
                </div>
                <div className="flex items-end justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save changes
                    </button>
                </div>
            </section>

            {/* <ApiKeySection appId={appId} /> */}

            <section className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Tenant access</h2>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                    >
                        <Plus className="h-4 w-4" /> Add tenant
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-left text-slate-500">
                            <th className="py-2 font-medium">Tenant</th>
                            <th className="py-2 font-medium">Access window</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.length === 0 && (
                            <tr><td colSpan={3} className="py-6 text-center text-slate-400">No tenants authorized yet.</td></tr>
                        )}
                        {tenants.map((t) => (
                            <tr key={t.id} className="border-b border-slate-50">
                                <td className="py-3">{t.name}</td>
                                <td className="py-3 text-slate-500">{formatWindow(t)}</td>
                                <td className="py-3 text-right">
                                    <button onClick={() => handleRemove(t)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <h2 className="mb-1 text-lg font-semibold text-red-700">Danger zone</h2>
                <p className="mb-4 text-sm text-red-600/80">
                    Deleting this application is permanent and cannot be undone. All tenant access to it will be removed.
                </p>
                <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" /> Delete application
                </button>
            </section>

            {isAddOpen && (
                <AddTenantModal
                    appId={appId}
                    existingIds={tenants.map((t) => t.id)}
                    onClose={() => setIsAddOpen(false)}
                    onAdded={async () => {
                        setIsAddOpen(false)
                        await fetchApplicationTenants(appId)
                    }}
                />
            )}

            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => !isDeleting && setIsDeleteOpen(false)}>
                    <div className={`${cardClass} w-full max-w-md`} onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold">Delete &quot;{app.name}&quot;?</h3>
                        </div>
                        <p className="text-sm text-slate-500">
                            This will permanently delete the application and revoke all tenant access to it. This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                disabled={isDeleting}
                                className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteApplication}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Delete application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const formatWindow = (t: TenantAccess) => {
    if (!t.starts_at && !t.ends_at) return 'Unlimited'
    const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—')
    return `${fmt(t.starts_at)} → ${fmt(t.ends_at)}`
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
    const { tenantOptions, fetchTenantsForSelect, addTenantAuthorization } = useApplicationStore()
    const [tenantId, setTenantId] = useState('')
    const [range, setRange] = useState({ start: '', end: '' })
    const [isSaving, setIsSaving] = useState(false)
    const options = tenantOptions.filter((o) => !existingIds.includes(o.id))

    useEffect(() => {
        fetchTenantsForSelect().catch(() => toast.error('Failed to load tenants'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setTenantId((current) => (current && options.some((o) => o.id === current)) ? current : (options[0]?.id ?? ''))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantOptions])

    const handleSave = async () => {
        if (!tenantId) return
        setIsSaving(true)
        try {
            await addTenantAuthorization({
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
                <h3 className="mb-4 text-lg font-semibold">Add tenant access</h3>
                <label className="text-sm">
                    <span className="mb-1 block text-slate-600">Tenant</span>
                    <select className={inputClass} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
                        {options.length === 0 && <option value="">No tenants available</option>}
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
