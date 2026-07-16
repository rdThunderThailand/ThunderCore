'use client'

import { ApplicationDetails } from '@/models/Application'
import {
    AlertCircle, CheckCircle2, ChevronLeft, Globe, Image as ImageIcon, Loader2, Palette, Save, X
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getApplicationById, updateApplication } from '../../actions'

export function ApplicationManagementidPortalCustomizationClient() {
    const params = useParams()
    const router = useRouter()
    const appId = params.id as string

    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        branding_color: '#7c3aed',
        logo_url: '',
        portal_title: '',
        portal_description: ''
    })

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
            setFormData({
                branding_color: data.branding_color || '#7c3aed',
                logo_url: data.logo_url || '',
                portal_title: data.portal_title || '',
                portal_description: data.portal_description || ''
            })
        } catch (err) {
            console.error('Error loading data:', err)
            setError('Failed to load application')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            await updateApplication(appId, {
                branding_color: formData.branding_color,
                logo_url: formData.logo_url,
                portal_title: formData.portal_title,
                portal_description: formData.portal_description
            })
            setSuccess('Portal settings updated successfully!')
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portal Customization</h1>
                <p className="text-slate-500 font-medium mt-2">Customize the look and feel of your public portal.</p>
            </div>

            <div className="space-y-8">
                {/* Branding Section */}
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
                            <Palette className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Branding</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Brand Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={formData.branding_color}
                                    onChange={(e) => setFormData({ ...formData, branding_color: e.target.value })}
                                    className="w-16 h-16 rounded-2xl cursor-pointer border-0 p-1 bg-white shadow-sm"
                                />
                                <input
                                    type="text"
                                    value={formData.branding_color}
                                    onChange={(e) => setFormData({ ...formData, branding_color: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-fuchsia-500 outline-none font-mono font-bold uppercase"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Logo URL</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="https://"
                                    className="w-full px-6 py-4 pl-12 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-fuchsia-500 focus:bg-white outline-none transition-all font-bold"
                                />
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Section */}
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">SEO Metadata</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Portal Title</label>
                            <input
                                type="text"
                                value={formData.portal_title}
                                onChange={(e) => setFormData({ ...formData, portal_title: e.target.value })}
                                placeholder={app?.name}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea
                                value={formData.portal_description}
                                onChange={(e) => setFormData({ ...formData, portal_description: e.target.value })}
                                rows={3}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold resize-none"
                            />
                        </div>
                    </div>
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
