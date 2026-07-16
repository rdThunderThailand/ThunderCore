'use client'

import { MoreHorizontal, CheckCircle2, AlertTriangle, MonitorSmartphone, XCircle, FileText, Activity } from 'lucide-react'
import { AssetActivityLog } from '../[assetId]/actions'
import { formatDistanceToNow, format } from 'date-fns'

interface TimelineProps {
    logs: AssetActivityLog[]
}

function getActivityIcon(type: string) {
    switch (type) {
        case 'STATUS_CHANGE': return <Activity className="w-4 h-4 text-emerald-500" />
        case 'DEVICE_LINK': return <MonitorSmartphone className="w-4 h-4 text-blue-500" />
        case 'DEVICE_UNLINK': return <XCircle className="w-4 h-4 text-red-500" />
        case 'ATTACHMENT_ADDED': return <FileText className="w-4 h-4 text-purple-500" />
        case 'WORK_ORDER_CREATED': return <AlertTriangle className="w-4 h-4 text-amber-500" />
        case 'WORK_ORDER_RESOLVED': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        default: return <MoreHorizontal className="w-4 h-4 text-slate-400" />
    }
}

function getActivityBg(type: string) {
    switch (type) {
        case 'STATUS_CHANGE': return 'bg-emerald-100 border-emerald-200'
        case 'DEVICE_LINK': return 'bg-blue-100 border-blue-200'
        case 'DEVICE_UNLINK': return 'bg-red-100 border-red-200'
        case 'ATTACHMENT_ADDED': return 'bg-purple-100 border-purple-200'
        case 'WORK_ORDER_CREATED': return 'bg-amber-100 border-amber-200'
        case 'WORK_ORDER_RESOLVED': return 'bg-emerald-100 border-emerald-200'
        default: return 'bg-slate-100 border-slate-200'
    }
}

export function AssetActivityTimeline({ logs }: TimelineProps) {

    if (!logs || logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
                <Activity className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">No Activity Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Activities will appear here once actions are performed on this asset.</p>
            </div>
        )
    }

    return (
        <div className="relative pl-6 border-l-2 border-slate-100 py-2 space-y-8">
            {logs.map((log) => (
                <div key={log.id} className="relative group">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[35px] w-8 h-8 rounded-full border ${getActivityBg(log.activity_type)} flex items-center justify-center bg-white shadow-sm ring-4 ring-white z-10 transition-transform group-hover:scale-110`}>
                        {getActivityIcon(log.activity_type)}
                    </div>

                    {/* Content Box */}
                    <div className="bg-white border text-sm border-slate-200 rounded-xl p-4 shadow-sm group-hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-slate-800 font-medium leading-relaxed">
                                    {log.description}
                                </p>

                                {/* Metadata blocks if any */}
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100/60 inline-flex flex-col gap-1.5 focus:outline-none">
                                        {Object.entries(log.metadata).map(([key, value]) => {
                                            if (key === 'reason') return null // Often handled in title or separately if needed
                                            return (
                                                <div key={key} className="flex items-center gap-2 text-[11px] font-mono whitespace-pre-wrap">
                                                    <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="text-slate-700">{String(value)}</span>
                                                </div>
                                            )
                                        })}
                                        {/* Show reason separately if it exists and wasn't the main description */}
                                        {typeof log.metadata.reason === 'string' && (
                                            <div className="flex gap-2 text-xs italic text-slate-500 mt-1 pt-2 border-t border-slate-200/50">
                                                <span>Reason:</span>
                                                <span className="text-slate-600">&quot;{log.metadata.reason}&quot;</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Timestamp */}
                            <div className="flex flex-col items-end shrink-0 text-right">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    {formatDistanceToNow(new Date(log.occurred_at), { addSuffix: true })}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                    {format(new Date(log.occurred_at), 'MMM d, yyyy HH:mm')}
                                </span>
                                {log.performed_by_name && (
                                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                                        <span>By</span>
                                        <span className="font-semibold text-slate-600">{log.performed_by_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
