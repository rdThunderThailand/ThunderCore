'use client'

import { format } from 'date-fns'

interface RecentActivitiesWidgetProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logs: any[]
}

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
            {logs.map((log) => {
                // Mock user data for the logs to match mockup style (usually audit logs should record the user who did the action)
                const mockImages = [
                    'https://i.pravatar.cc/150?u=a042581f4e29026704a',
                    'https://i.pravatar.cc/150?u=a042581f4e29026704b',
                    'https://i.pravatar.cc/150?u=a042581f4e29026704c'
                ]
                // eslint-disable-next-line react-hooks/purity
                const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)]
                // eslint-disable-next-line react-hooks/purity
                const randomName = ['Johnny Depp', 'John Travolta', 'Sarah Connor'][Math.floor(Math.random() * 3)]

                return (
                    <div key={log.id} className="flex gap-4 relative z-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={randomImage}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                        />
                        <div className="flex flex-col flex-1 pb-1 border-b border-slate-100 last:border-0">
                            <div className="flex justify-between items-center w-full mb-0.5">
                                <span className="text-sm font-bold text-slate-900">{randomName}</span>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {log.created_at ? format(new Date(log.created_at), 'hh:mm a') : '00:00 AM'}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 line-clamp-2">
                                {log.action || 'Activity Action'} - {log.description || 'Description'}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
