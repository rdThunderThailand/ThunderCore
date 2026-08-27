export default function EmailField({
    error,
    defaultValue,
    readOnly,
}: {
    error?: string
    defaultValue?: string
    readOnly?: boolean
}) {
    return (
        <div className="space-y-1">
            <label htmlFor="email" className="text-slate-700 text-sm font-bold ml-1">Email Address</label>
            <div className="relative">
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    defaultValue={defaultValue}
                    readOnly={readOnly}
                    className={`w-full h-10 px-4 bg-white border rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${error ? 'border-red-500' : 'border-slate-200'} ${readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                />
            </div>
            {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
        </div>
    )
}
