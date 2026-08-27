'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface LicensesChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quota: any
}

export function LicensesChart({ quota }: LicensesChartProps) {
    const used = quota.used_assets || 0
    const max = quota.max_assets || 0
    const remain = Math.max(0, max - used)

    const data = [
        { name: 'Used', value: used, color: '#0F53FF' },    // Brand blue
        { name: 'Remain', value: remain, color: '#E2E8F0' } // Slate 200
    ]

    return (
        <div className="flex flex-col h-[300px] w-full">
            {/* Chart Top */}
            <div className="flex-1 w-full relative -mt-4">
                <ResponsiveContainer width="99%" height={250} minWidth={1} minHeight={1}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={105}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={0}
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                    <span className="text-sm font-bold text-slate-400">Licenses</span>
                    <span className="text-4xl font-black text-slate-800">{max}</span>
                </div>
            </div>

            {/* Legend Bottom */}
            <div className="flex justify-around items-center pt-4 border-t border-slate-100 mt-2">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-blue-600 mb-1">Used</span>
                    <span className="text-xl font-black text-slate-800">{used}</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-500 mb-1">Remain</span>
                    <span className="text-xl font-black text-slate-800">{remain}</span>
                </div>
            </div>
        </div>
    )
}
