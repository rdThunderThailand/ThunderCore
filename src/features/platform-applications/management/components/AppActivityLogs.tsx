'use client'

import { Info } from 'lucide-react'

interface ActivityLog {
    id: string
    event: string
    timestamp: string
    status: 'success' | 'error' | 'warning'
}

interface AppActivityLogsProps {
    logs: ActivityLog[]
}

export function AppActivityLogs({ logs }: AppActivityLogsProps) {
    return (
        <div className="h-full rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">Recent Logs</h3>
                    <p className="text-sm text-slate-400">Latest application events</p>
                </div>
                <button className="text-xs font-semibold uppercase tracking-widest text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-3">
                {logs.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-400">No recent activity detected.</p>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="group flex items-center gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-slate-100 hover:bg-slate-50">
                            <div className={`h-2 w-2 rounded-full ring-4 ${
                                log.status === 'success' ? 'bg-emerald-500 ring-emerald-50' :
                                log.status === 'error' ? 'bg-red-500 ring-red-50' :
                                'bg-amber-500 ring-amber-50'
                            }`} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{log.event}</p>
                                <p className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                    {log.timestamp}
                                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                                    Thunder-SDK v2.1.0
                                </p>
                            </div>
                            <button className="p-2 text-slate-300 opacity-0 transition-opacity hover:text-slate-900 group-hover:opacity-100">
                                <Info className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
