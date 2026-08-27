'use client'

import { PieChart, Pie, Cell } from 'recharts'

interface ChatsGaugeProps {
    remaining: number
    total: number
}

// Half-donut gauge: a single arc (180°→0°) split into filled/empty segments by `remaining`.
export function ChatsGauge({ remaining, total }: ChatsGaugeProps) {
    const safeTotal = total > 0 ? total : 1
    const filled = Math.min(safeTotal, Math.max(0, remaining))
    const data = [
        { name: 'Remaining', value: filled, color: '#0F53FF' },
        { name: 'Used', value: safeTotal - filled, color: '#E2E8F0' },
    ]

    return (
        <div className="flex flex-col items-center">
            <PieChart width={220} height={130}>
                <Pie
                    data={data}
                    cx={110}
                    cy={110}
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
            <div className="-mt-14 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Remaining</span>
                <span className="text-2xl font-black text-slate-900">{filled.toLocaleString()}</span>
            </div>
        </div>
    )
}
