'use client'

import { LayoutGrid } from 'lucide-react'

interface OrgAccessTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tenants: any[]
    onAddClick: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDeleteClick: (org: any) => void
}

export function OrgAccessTable({ tenants, onAddClick, onDeleteClick }: OrgAccessTableProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Tenants</h3>
                    <p className="text-slate-400 text-sm mt-1">A list of tenants using this application</p>
                </div>
                <button
                    onClick={onAddClick}
                    className="px-4 py-2 bg-[#0F53FF] text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 flex items-center gap-2 text-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Add Tenant
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-4 w-10">
                                <input type="checkbox" className="rounded border-slate-300" />
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">Image</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">Tenant</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-center">Status</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">Started At</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">Expired At</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
                                            <LayoutGrid className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium">No Data</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            tenants.map((org: any) => (
                                <tr key={org.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <input type="checkbox" className="rounded border-slate-300" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                                            <LayoutGrid className="w-4 h-4" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm font-medium text-slate-700">{org.name}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-slate-500">
                                            {new Date(org.joinedAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-slate-500">
                                            {org.expiredAt ? new Date(org.expiredAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            }) : '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => onDeleteClick(org)}
                                            className="text-blue-600 text-sm hover:underline font-medium hover:text-blue-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination (Static for now) */}
                <div className="p-4 border-t border-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <span>Page 1 of 5</span>
                    <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 disabled:opacity-50">&lt;</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 font-bold border border-blue-100">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">3</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">4</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">5</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
