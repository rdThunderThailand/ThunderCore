'use client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BarChart3, Database, History, Info, Users } from 'lucide-react'

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
        { label: 'Total Requests', value: stats.totalRequests.toLocaleString(), icon: History, color: 'text-violet-600', bg: 'bg-violet-50', trend: '+12.5%' },
        { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.2%' },
        { label: 'Database Storage', value: `${stats.dbStorage}MB`, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '85%' },
        { label: 'Avg Latency', value: stats.avgLatency, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2ms' },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 ${stat.bg} rounded-3xl group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                            {stat.trend}
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-end gap-2 text-slate-900">
                        <h4 className="text-3xl font-black tracking-tight">{stat.value}</h4>
                        {i === 3 && <span className="text-sm font-bold text-slate-400 mb-1">ms</span>}
                    </div>
                </div>
            ))}
        </div>
    )
}
