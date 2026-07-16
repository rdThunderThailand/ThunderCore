'use client'

import { Info } from 'lucide-react'

export function AppUsageCharts() {
    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900">Activity Overview</h3>
                    <p className="text-slate-400 text-sm font-bold">Request volume over the last 24 hours</p>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <Info className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 min-h-[250px] bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center p-8">
                {/* Simplified Chart Placeholder */}
                <div className="w-full h-full flex items-end gap-2">
                    {[40, 65, 45, 90, 55, 70, 45, 80, 60, 95, 50, 65].map((h, i) => (
                        <div key={i} className="flex-1 bg-violet-200/50 rounded-t-lg transition-all hover:bg-violet-500 group relative" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h * 10}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
            </div>
        </div>
    )
}
