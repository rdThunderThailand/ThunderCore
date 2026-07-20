'use client'

import { calcTotalPages, paginate, Pagination } from '@/components/ui'
import { getDevRole } from '@/lib/dev'
import { SystemApplication } from '@/models/Application'
import { AppWindow, Globe, LayoutGrid, Loader2, Plus, Search, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createApplication, deleteApplication, getAllApplications, getTenantsForSelect } from './actions'

const STATUS_STYLES: Record<SystemApplication['status'], string> = {
    active: 'bg-green-50 text-green-600',
    maintenance: 'bg-amber-50 text-amber-600',
    inactive: 'bg-slate-100 text-slate-500',
}

const PAGE_SIZE = 8

export function ApplicationHomeClient() {
    const isSuperAdmin = getDevRole() === 'super_admin'

    const [apps, setApps] = useState<SystemApplication[]>([])
    const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [page, setPage] = useState(1)

    useEffect(() => {
        Promise.all([getAllApplications(), getTenantsForSelect()])
            .then(([appsData, tenantList]) => {
                setApps(appsData)
                setTenants(tenantList)
            })
            .catch((err) => toast.error((err as Error).message))
            .finally(() => setIsLoading(false))
    }, [])

    const filtered = useMemo(
        () => apps.filter((a) => a.name.toLowerCase().includes(search.toLowerCase())),
        [apps, search]
    )

    // Reset page when search changes
    useEffect(() => { setPage(1) }, [search])

    const thisMonth = useMemo(() => {
        const now = new Date()
        return apps.filter((a) => {
            const d = new Date(a.created_at)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length
    }, [apps])

    const pages = calcTotalPages(filtered.length, PAGE_SIZE)
    const pageItems = paginate(filtered, page, PAGE_SIZE)

    const handleDelete = async (id: string) => {
        if (!isSuperAdmin || !confirm('Delete this application?')) return
        const prev = apps
        setApps(apps.filter((a) => a.id !== id)) // optimistic
        try {
            await deleteApplication(id)
            toast.success('Application deleted')
        } catch (err) {
            setApps(prev) // rollback + toast on failure
            toast.error((err as Error).message)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading applications…
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden p-8 gap-6 font-sans text-slate-900">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <StatCard label="Total Applications" value={apps.length} sub="All time" icon={LayoutGrid} tint="bg-blue-50 text-blue-600" />
                <StatCard
                    label="Created This Month"
                    value={thisMonth}
                    sub={new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    icon={Plus}
                    tint="bg-emerald-50 text-emerald-600"
                />
            </div>

            {/* Table card — fills remaining height */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-0 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by application name"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full md:w-auto px-6 py-2.5 bg-[#0F53FF] text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Create Application
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto mt-4">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                            <AppWindow className="w-8 h-8" />
                            No applications found.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white">
                                <tr className="text-left text-slate-400 border-b border-slate-100">
                                    <th className="py-3 font-medium">Name</th>
                                    <th className="py-3 font-medium">Owner</th>
                                    <th className="py-3 font-medium">Environment</th>
                                    <th className="py-3 font-medium">Status</th>
                                    <th className="py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((app) => (
                                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="py-3">
                                            <Link href={`/applications/management/${app.id}`} className="font-medium text-slate-900 hover:text-blue-600 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-slate-300" /> {app.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 text-slate-500">{app.tenant_name ?? (app.is_shared ? 'System (shared)' : '—')}</td>
                                        <td className="py-3 text-slate-500">{app.environment}</td>
                                        <td className="py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[app.status]}`}>{app.status}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            {isSuperAdmin && (
                                                <button onClick={() => handleDelete(app.id)} className="text-slate-400 hover:text-red-600 p-1.5" aria-label="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination page={page} totalPages={pages} onChange={setPage} className="shrink-0 mt-2" />
            </div>

            {isModalOpen && (
                <CreateModal
                    tenants={tenants}
                    onClose={() => setIsModalOpen(false)}
                    onCreated={(app) => {
                        setApps((prev) => [app, ...prev])
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

function StatCard({ label, value, sub, icon: Icon, tint }: { label: string; value: number; sub: string; icon: typeof LayoutGrid; tint: string }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-start">
            <div>
                <p className="text-slate-500 font-medium mb-4">{label}</p>
                <h2 className="text-4xl font-bold">{value}</h2>
                <p className="text-slate-400 text-xs mt-1 font-medium">{sub}</p>
            </div>
            <div className={`p-3 rounded-xl ${tint}`}>
                <Icon className="w-8 h-8" />
            </div>
        </div>
    )
}

function CreateModal({
    tenants,
    onClose,
    onCreated,
}: {
    tenants: Array<{ id: string; name: string }>
    onClose: () => void
    onCreated: (app: SystemApplication) => void
}) {
    const [name, setName] = useState('')
    const [tenantId, setTenantId] = useState<string>('') // '' = system app
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!name.trim()) return
        setIsSubmitting(true)
        try {
            const app = await createApplication(name.trim(), tenantId || null)
            toast.success('Application created')
            onCreated(app)
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Create Application</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Owner</label>
                    <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white">
                        <option value="">System (shared)</option>
                        {tenants.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || isSubmitting}
                    className="w-full px-6 py-2.5 bg-[#0F53FF] text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
                </button>
            </div>
        </div>
    )
}
