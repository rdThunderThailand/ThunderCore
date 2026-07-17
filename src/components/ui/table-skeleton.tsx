import { Monitor, Search } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function TableSkeleton({ title, description, icon: Icon = Monitor, hasStats = false }: { title: string, description: string, icon?: any, hasStats?: boolean }) {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-200 tracking-tight animate-pulse bg-slate-200 rounded-lg w-64 h-10"></h1>
                    <p className="text-slate-200 font-bold mt-2 animate-pulse bg-slate-200 rounded-md w-96 h-5"></p>
                </div>
                <div className="px-8 py-3.5 bg-slate-200 rounded-[2rem] w-40 h-12 animate-pulse"></div>
            </div>

            {/* Optional Stats Row */}
            {hasStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm h-32 lg:h-40 animate-pulse">
                            <div className="w-24 h-4 bg-slate-200 rounded mb-4"></div>
                            <div className="w-16 h-8 bg-slate-200 rounded"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200" />
                        <div className="w-full h-12 bg-slate-50 rounded-2xl animate-pulse"></div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-8 py-5">
                                        <div className="w-20 h-3 bg-slate-200 rounded animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse shrink-0"></div>
                                            <div className="space-y-2">
                                                <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
                                                <div className="w-24 h-3 bg-slate-100 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                    </td>
                                    {[1, 2, 3].map((col) => (
                                        <td key={col} className="px-8 py-6">
                                            <div className="w-24 h-4 bg-slate-100 rounded animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
