interface StatCardProps {
    label: string
    value: string
    subtext?: string
    icon: React.ReactNode
    iconBg: string
}

export function StatCard({ label, value, subtext, icon, iconBg }: StatCardProps) {
    return (
        <div className="flex items-start justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
            <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
                {subtext && <p className="mt-1 text-xs text-slate-400 font-medium">{subtext}</p>}
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg} text-white shadow-xs`}>
                {icon}
            </div>
        </div>
    )
}
