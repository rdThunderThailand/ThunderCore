'use client'

import { launchApplication } from '@/features/platform-tenants/management/[id]/applications/actions'
import { AppWindow, ExternalLink, Globe, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AppManagementHeaderProps {
    app: {
        id: string
        tenant_id: string
        name: string
        status: string
        url?: string
    }
    // onUpdateIdentity: () => void
}

export function AppManagementHeader({ app }: AppManagementHeaderProps) {
    const [isLaunching, setIsLaunching] = useState(false)

    const handleLaunch = async () => {
        setIsLaunching(true)
        try {
            const launchUrl = await launchApplication(app.tenant_id, app.id)
            window.open(launchUrl, '_blank')
        } catch {
            toast.error('Failed to launch application')
        } finally {
            setIsLaunching(false)
        }
    }

    const statusClass =
        app.status === 'active'
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : app.status === 'maintenance'
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-slate-50 text-slate-600 border-slate-100'

    return (
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                    <AppWindow className="h-8 w-8 text-white" />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{app.name}</h1>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${statusClass}`}>
                            {app.status}
                        </span>
                    </div>
                    {app.url && (
                        <div className="mt-1 flex items-center gap-2 text-slate-400">
                            <Globe className="h-4 w-4" />
                            <button
                                onClick={handleLaunch}
                                disabled={isLaunching}
                                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-blue-600 disabled:opacity-60"
                            >
                                {app.url}
                                {isLaunching ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* <button
                onClick={onUpdateIdentity}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
                Update Identity
            </button> */}
        </div>
    )
}
