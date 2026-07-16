'use client'

import { launchApplication } from '@/features/platform-tenants/management/[id]/applications/actions'
import { AppWindow, ExternalLink, Globe, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface AppManagementHeaderProps {
    app: {
        id: string
        tenant_id: string
        name: string
        status: string
        url?: string
    }
    onUpdateIdentity: () => void
}

export function AppManagementHeader({ app, onUpdateIdentity }: AppManagementHeaderProps) {
    const [isLaunching, setIsLaunching] = useState(false)

    const handleLaunch = async () => {
        setIsLaunching(true)
        try {
            const launchUrl = await launchApplication(app.tenant_id, app.id)
            window.open(launchUrl, '_blank')
        } catch (err) {
            console.error(err)
        } finally {
            setIsLaunching(false)
        }
    }

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-violet-600 rounded-4xl flex items-center justify-center shadow-2xl shadow-violet-200">
                    <AppWindow className="w-10 h-10 text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{app.name}</h1>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${app.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : app.status === 'maintenance'
                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                            {app.status}
                        </span>
                    </div>
                    {app.url && (
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <Globe className="w-4 h-4" />
                            <button onClick={handleLaunch} disabled={isLaunching} className="text-sm font-bold hover:text-violet-600 transition-colors flex items-center gap-1 disabled:opacity-60">
                                {app.url}
                                {isLaunching ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <button
                onClick={onUpdateIdentity}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-95"
            >
                Update Identity
            </button>
        </div>
    )
}
