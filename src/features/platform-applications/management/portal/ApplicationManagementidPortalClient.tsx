'use client'

import { ApplicationDetails } from '@/types/applications'
import { launchApplication } from '@/features/platform-tenants/management/[id]/applications/actions'
import { AlertCircle, ChevronLeft, ExternalLink, Globe, Layout, Loader2, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getApplicationById } from '../../actions'

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6'

export function ApplicationManagementidPortalClient({ appId, basePath = '/applications' }: { appId: string; basePath?: string }) {
    const router = useRouter()
    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLaunching, setIsLaunching] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getApplicationById(appId)
                if (!data) {
                    router.push(basePath)
                    return
                }
                setApp(data)
            } catch {
                toast.error('Failed to load portal configuration')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId, router, basePath])

    const handleLaunch = async () => {
        if (!app || !app.tenant_id) return
        if (app.custom_domain) {
            window.open(`https://${app.custom_domain}`, '_blank')
            return
        }
        setIsLaunching(true)
        try {
            const launchUrl = await launchApplication(app.tenant_id, app.id)
            window.open(launchUrl, '_blank')
        } catch {
            toast.error('Failed to launch portal')
        } finally {
            setIsLaunching(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!app) return null

    const hasUrl = Boolean(app.custom_domain || app.url)

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Portal Configuration</h1>
                    <p className="text-sm text-slate-500">Manage the public-facing portal for {app.name}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Portal preview / launch */}
                <section className={`${cardClass} flex flex-col items-center justify-center gap-5 text-center`}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                        <Layout className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Public Portal</h2>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                            The customer-facing interface for {app.name}.
                        </p>
                    </div>
                    {hasUrl ? (
                        <button
                            onClick={handleLaunch}
                            disabled={isLaunching}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLaunching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                            Launch Portal
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-600">
                            <AlertCircle className="h-4 w-4" />
                            No URL Configured
                        </div>
                    )}
                </section>

                {/* Configuration options */}
                <div className="space-y-6">
                    <button
                        onClick={() => router.push(`${basePath}/${appId}/portal/domains`)}
                        className={`${cardClass} block w-full text-left transition-shadow hover:shadow-md`}
                    >
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                <Globe className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Domain Settings</h3>
                        </div>
                        <p className="text-sm text-slate-500">Configure custom domains and SSL certificates for your portal.</p>
                    </button>

                    <button
                        onClick={() => router.push(`${basePath}/${appId}/portal/customization`)}
                        className={`${cardClass} block w-full text-left transition-shadow hover:shadow-md`}
                    >
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Portal Customization</h3>
                        </div>
                        <p className="text-sm text-slate-500">Customize branding, themes, and layout options.</p>
                    </button>
                </div>
            </div>
        </div>
    )
}
