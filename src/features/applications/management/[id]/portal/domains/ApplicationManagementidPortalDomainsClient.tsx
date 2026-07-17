'use client'

import { ApplicationDetails } from '@/models/Application'
import {
    AlertCircle, CheckCircle2, ChevronLeft,
    Globe, Info, Loader2, Save, X
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getApplicationById, updateApplication } from '../../actions'

export function ApplicationManagementidPortalDomainsClient() {
    const params = useParams()
    const router = useRouter()
    const appId = params.id as string

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [domain, setDomain] = useState('')

    useEffect(() => {
        loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const data = await getApplicationById(appId)
            if (!data) {
                router.push('/dashboard/application')
                return
            }
            setApp(data)
            setDomain(data.custom_domain || '')
        } catch (err) {
            console.error('Error loading data:', err)
            setError('Failed to load application')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        // Clean domain automatically
        let cleanedDomain = domain.trim().toLowerCase()
        cleanedDomain = cleanedDomain.replace(/^https?:\/\//, '')
        cleanedDomain = cleanedDomain.replace(/\/$/, '')

        if (domain !== cleanedDomain) {
            setDomain(cleanedDomain)
        }

        // Basic validation
        if (cleanedDomain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanedDomain)) {
            setError('Please enter a valid domain name (e.g., portal.example.com)')
            return
        }

        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            await updateApplication(appId, {
                custom_domain: cleanedDomain || null // Send null if empty to clear
            })
            setSuccess('Domain settings updated successfully!')
            setApp(prev => prev ? { ...prev, custom_domain: cleanedDomain || null } : null)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-12 space-y-8 animate-in fade-in duration-500 bg-white min-h-screen">
            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-4 text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <p>{success}</p>
                </div>
            )}

            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Portal
            </button>

            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Domain Configuration</h1>
                <p className="text-slate-500 font-medium mt-2">Connect a custom domain to your portal.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Custom Domain</h3>
                        <p className="text-sm text-slate-500">Enter the domain you want to use for this portal.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Domain Name</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="portal.example.com"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                        />
                    </div>
                    {domain && (
                        <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl text-sm text-blue-800 border border-blue-100">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <div>
                                <p className="font-bold mb-1">DNS Configuration Required</p>
                                <p>To activate this domain, configure a CNAME record pointing to <code className="font-mono font-bold">portal.trysupabase.com</code> (Mock).</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    )
}
