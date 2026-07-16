'use client'

import { ApplicationDetails } from '@/models/Application'
import {
    AlertCircle, ChevronLeft,
    ExternalLink, Globe, Layout, Loader2, Settings
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getApplicationById } from '../actions'
import { launchApplication } from '@/features/platform-tenants/management/[id]/applications/actions'

export function ApplicationManagementidPortalClient() {
    const params = useParams()
    const router = useRouter()
    const appId = params.id as string

    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLaunching, setIsLaunching] = useState(false)

    useEffect(() => {
        const loadApp = async () => {
            try {
                const data = await getApplicationById(appId)
                if (!data) {
                    router.push('/dashboard/application')
                    return
                }
                setApp(data)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        loadApp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId])

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
        )
    }

    if (!app) return null

    const handleLaunch = async () => {
        if (app.custom_domain) {
            window.open(`https://${app.custom_domain}`, '_blank')
            return
        }
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
        <div className="max-w-7xl mx-auto p-12 space-y-12 animate-in fade-in duration-700 bg-white min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Portal Configuration</h1>
                    <p className="text-slate-500 font-medium">Manage the public-facing portal for {app.name}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border rounded-xl text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Portal Preview Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Layout className="w-10 h-10 text-violet-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Public Portal</h2>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            The customer-facing interface for {app.name}.
                        </p>
                    </div>
                    {app.custom_domain || app.url ? (
                        <button
                            onClick={handleLaunch}
                            disabled={isLaunching}
                            className="px-8 py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 active:scale-95 flex items-center gap-2 disabled:opacity-60"
                        >
                            {isLaunching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                            Launch Portal
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-bold text-sm">No URL Configured</span>
                        </div>
                    )}
                </div>

                {/* Configuration Options */}
                <div className="space-y-6">
                    <div
                        onClick={() => router.push(`/dashboard/application/management/${appId}/portal/domains`)}
                        className="bg-white border border-slate-100 rounded-[2rem] p-8 hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Domain Settings</h3>
                        </div>
                        <p className="text-slate-500 text-sm">Configure custom domains and SSL certificates for your portal.</p>
                    </div>

                    <div
                        onClick={() => router.push(`/dashboard/application/management/${appId}/portal/customization`)}
                        className="bg-white border border-slate-100 rounded-[2rem] p-8 hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Portal Customization</h3>
                        </div>
                        <p className="text-slate-500 text-sm">Customize branding, themes, and layout options.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
