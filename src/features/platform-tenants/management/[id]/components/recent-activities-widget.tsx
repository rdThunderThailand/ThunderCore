'use client'

import { format } from 'date-fns'
import { Activity } from 'lucide-react'

interface RecentActivitiesWidgetProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logs: any[]
}

// The activity log has no actor field (see TenantDashboardLog) — there's no real user to show
// per entry, so this uses a neutral activity icon rather than inventing one.
export function RecentActivitiesWidget({ logs }: RecentActivitiesWidgetProps) {
    if (!logs || logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 text-sm">
                No recent activities.
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4 relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200" />
            {logs.map((log) => (
                <div key={log.id} className="flex gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col flex-1 pb-1 border-b border-slate-100 last:border-0">
                        <div className="flex justify-between items-center w-full mb-0.5">
                            <span className="text-sm font-bold text-slate-900">{log.action || 'Activity'}</span>
                            <span className="text-[10px] font-bold text-slate-400">
                                {log.created_at ? format(new Date(log.created_at), 'hh:mm a') : '00:00 AM'}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 line-clamp-2">
                            {log.description || 'No description'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
