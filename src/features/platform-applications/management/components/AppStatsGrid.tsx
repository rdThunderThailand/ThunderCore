'use client'

import { BarChart3, Database, History, Users } from 'lucide-react'

interface AppStatsGridProps {
    stats: {
        totalRequests: number
        activeUsers: number
        dbStorage: number
        avgLatency: string
    }
}

export function AppStatsGrid({ stats }: AppStatsGridProps) {
    const statItems = [
        { label: 'Total Requests', value: stats.totalRequests.toLocaleString(), icon: History, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12.5%' },
        { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+5.2%' },
        { label: 'Database Storage', value: `${stats.dbStorage}MB`, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '85%' },
        { label: 'Avg Latency', value: `${stats.avgLatency}ms`, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2ms' },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md">
                    <div className="mb-4 flex items-start justify-between">
                        <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                            {stat.trend}
                        </span>
                    </div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <h4 className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</h4>
                </div>
            ))}
        </div>
    )
}
