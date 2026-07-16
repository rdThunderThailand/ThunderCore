// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StatCardWithIcon({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: 'blue' | 'amber' | 'emerald' | 'red' }) {
    const styles = {
        blue: { text: 'text-blue-600', bg: 'bg-blue-50', icon: 'text-blue-500' },
        amber: { text: 'text-amber-600', bg: 'bg-amber-50', icon: 'text-amber-500' },
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'text-emerald-500' },
        red: { text: 'text-red-600', bg: 'bg-red-50', icon: 'text-red-500' },
    }
    const style = styles[color]

    return (
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div>
                <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                <h3 className="text-3xl font-black text-slate-900">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center ${style.icon} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    )
}
