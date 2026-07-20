'use client'

import { Info } from 'lucide-react'

// ponytail: static placeholder bars — swap for recharts when real usage data lands.
const BARS = [40, 65, 45, 90, 55, 70, 45, 80, 60, 95, 50, 65]

export function AppUsageCharts() {
    return (
        <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">Activity Overview</h3>
                    <p className="text-sm text-slate-400">Request volume over the last 24 hours</p>
                </div>
                <button className="p-2 text-slate-300 transition-colors hover:text-slate-900">
                    <Info className="h-5 w-5" />
                </button>
            </div>
            <div className="flex min-h-[220px] flex-1 items-end gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
                {BARS.map((h, i) => (
                    <div
                        key={i}
                        className="group relative flex-1 rounded-t-lg bg-blue-200/60 transition-all hover:bg-blue-500"
                        style={{ height: `${h}%` }}
                    >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {h * 10}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-between px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
            </div>
        </div>
    )
}
