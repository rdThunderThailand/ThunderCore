'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Loader2, Network, Plus, Unlink } from 'lucide-react'
import { toast } from 'sonner'
import type { Tenant } from '@/types/tenants'
import { attachChildTenant, detachChildTenant } from './actions'

// Child Tenants (super admin): the direct children of this tenant, attach an existing tenant as a child,
// detach one. Partners of this tenant switch into exactly these children (Thunder_Core ADR 0027).
// Not optimistic: each change waits for Core, then the page re-renders from the server (revalidatePath);
// a failure leaves the list unchanged and shows Core's reason in a toast.

export function ChildTenantsClient({ parent, childTenants, candidates }: { parent: Tenant; childTenants: Tenant[]; candidates: Tenant[] }) {
    const [childId, setChildId] = useState('')
    const [pending, startTransition] = useTransition()

    const attach = () => {
        if (!childId) return
        startTransition(async () => {
            const r = await attachChildTenant(parent.id, parent.id, childId)
            if (r.ok) {
                toast.success('Child tenant attached')
                setChildId('')
            } else toast.error(r.error)
        })
    }

    const detach = (child: Tenant) => {
        if (!window.confirm(`Detach "${child.name}" from ${parent.name}? Partners of ${parent.name} will lose access to it.`)) return
        startTransition(async () => {
            const r = await detachChildTenant(parent.id, child.id)
            if (r.ok) toast.success('Child tenant detached')
            else toast.error(r.error)
        })
    }

    return (
        <div className="mx-auto w-full space-y-6 px-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Child tenants</h1>
                <p className="text-sm text-slate-500">
                    Tenants under {parent.name}. Users with the Partner role in {parent.name} can switch into these tenants and manage them as an admin.
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <label className="min-w-72 flex-1 text-sm">
                    <span className="mb-1 block font-semibold text-slate-700">Attach an existing tenant</span>
                    <select value={childId} onChange={(e) => setChildId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500">
                        <option value="">Select a tenant…</option>
                        {candidates.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}{t.parentTenantId ? ' (moves from its current parent)' : ''}</option>
                        ))}
                    </select>
                </label>
                <button onClick={attach} disabled={!childId || pending} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Attach as child
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {childTenants.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-14 text-center text-sm text-slate-500">
                        <Network className="h-8 w-8 text-slate-300" />
                        No child tenants yet — attach one above.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr><th className="px-4 py-3 text-left">Tenant</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Members</th><th className="px-4 py-3 text-right">Apps</th><th className="px-4 py-3" /></tr>
                        </thead>
                        <tbody>
                            {childTenants.map((c) => (
                                <tr key={c.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3"><Link href={`/tenants/management/${c.id}`} className="font-semibold text-blue-700 hover:underline">{c.name}</Link></td>
                                    <td className="px-4 py-3 capitalize">{c.status}</td>
                                    <td className="px-4 py-3 text-right">{c.memberCount}</td>
                                    <td className="px-4 py-3 text-right">{c.appCount}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => detach(c)} disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                                            <Unlink className="h-3.5 w-3.5" /> Detach
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
