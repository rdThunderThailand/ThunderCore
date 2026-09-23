'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface PlayerStatusChartProps {
    status: {
        online: number
        offline: number
        busy: number
        error: number
        total: number
    }
}

export function PlayerStatusChart({ status }: PlayerStatusChartProps) {
    const data = [
        { name: 'Online', value: status.online, color: '#10B981' }, // Emerald 500
        { name: 'Offline', value: status.offline, color: '#f87171' }, // Red 400
        { name: 'Busy', value: status.busy, color: '#fbbf24' },     // Amber 400
        { name: 'Error', value: status.error, color: '#e5e7eb' },  // Gray 200 (Mock using gray for errors/unregistered)
    ]

    return (
        <div className="flex h-[300px] w-full items-center">
            {/* Legend Left */}
            <div className="flex flex-col gap-4 w-1/3 pr-4 border-r border-slate-100">
                {data.map((item) => (
                    <div key={item.name} className="flex flex-col items-center">
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.name}</span>
                        <span className="text-lg font-black text-slate-800">{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Chart Right */}
            <div className="flex-1 h-full relative min-h-0" style={{minHeight: 200}}>
                <ResponsiveContainer width="99%" height={250} minWidth={1} minHeight={1}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-bold text-slate-400">Players</span>
                    <span className="text-3xl font-black text-slate-800">{status.total}</span>
                </div>
            </div>
        </div>
    )
}
