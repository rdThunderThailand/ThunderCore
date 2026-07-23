'use client'

import { ChevronLeft, Globe, Info, Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getApplicationById, updateApplication } from '../../../actions'

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6'
const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500'

export function ApplicationManagementidPortalDomainsClient({ appId, basePath = '/applications' }: { appId: string; basePath?: string }) {
    const router = useRouter()
    const [domain, setDomain] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getApplicationById(appId)
                if (!data) {
                    router.push(basePath)
                    return
                }
                setDomain(data.custom_domain ?? '')
            } catch {
                toast.error('Failed to load application')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId, router, basePath])

    const handleSave = async () => {
        // Normalize: strip protocol + trailing slash, lowercase.
        const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
        if (cleaned !== domain) setDomain(cleaned)

        if (cleaned && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleaned)) {
            toast.error('Please enter a valid domain name (e.g., portal.example.com)')
            return
        }

        setIsSaving(true)
        try {
            await updateApplication(appId, { custom_domain: cleaned || null })
            toast.success('Domain settings updated')
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Domain Configuration</h1>
                    <p className="text-sm text-slate-500">Connect a custom domain to your portal.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>
            </div>

            <section className={`${cardClass} space-y-5`}>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                        <Globe className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">Custom Domain</h2>
                        <p className="text-sm text-slate-500">Enter the domain you want to use for this portal.</p>
                    </div>
                </div>

                <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Domain Name</span>
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="portal.example.com"
                        className={inputClass}
                    />
                </label>

                {domain && (
                    <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                        <Info className="h-5 w-5 shrink-0" />
                        <div>
                            <p className="mb-1 font-medium">DNS Configuration Required</p>
                            <p>
                                To activate this domain, configure a CNAME record pointing to{' '}
                                <code className="font-mono font-semibold">portal.thunder.co.th</code>.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </section>
        </div>
    )
}
