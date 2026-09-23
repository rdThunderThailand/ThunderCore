'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const CHAT_PROGRESS_DATA = [
    { month: 'JAN', study: 32, onlineTest: 14 },
    { month: 'FEB', study: 22, onlineTest: 12 },
    { month: 'MAR', study: 45, onlineTest: 30 },
    { month: 'APR', study: 28, onlineTest: 16 },
    { month: 'MAY', study: 16, onlineTest: 10 },
]

const SERIES_COLOR: Record<string, string> = {
    study: '#2563eb',
    onlineTest: '#38bdf8',
}

interface ChatProgressTooltipProps {
    active?: boolean
    label?: string
    payload?: { dataKey: string; value: number }[]
}

function ChatProgressTooltip({ active, payload, label }: ChatProgressTooltipProps) {
    if (!active || !payload?.length) return null
    return (
        <div className="flex flex-col gap-1 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-medium text-white shadow-xl">
            <p className="font-bold">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: SERIES_COLOR[entry.dataKey] }} />
                    <span>{entry.value} HR</span>
                </div>
            ))}
        </div>
    )
}

export function ChatProgressChart() {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHAT_PROGRESS_DATA} barCategoryGap={28}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                    />
                    <YAxis
                        tickFormatter={(v) => `${v} HR`}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                        tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }}
                    />
                    <Tooltip content={<ChatProgressTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="study" stackId="hours" fill={SERIES_COLOR.study} />
                    <Bar dataKey="onlineTest" stackId="hours" fill={SERIES_COLOR.onlineTest} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
