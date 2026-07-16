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
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Recent Logs</h3>
                    <p className="text-slate-400 text-sm font-bold">Latest application events</p>
                </div>
                <button className="text-violet-600 text-xs font-black uppercase tracking-widest hover:text-violet-700">View All</button>
            </div>
            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-400 text-sm">No recent activity detected.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                            <div className={`w-2 h-2 rounded-full ring-4 ${log.status === 'success' ? 'bg-emerald-500 ring-emerald-50' :
                                log.status === 'error' ? 'bg-red-500 ring-red-50' :
                                    'bg-amber-500 ring-amber-50'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">{log.event}</p>
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                    {log.timestamp}
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    Thunder-SDK v2.1.0
                                </p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-slate-900">
                                <Info className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
