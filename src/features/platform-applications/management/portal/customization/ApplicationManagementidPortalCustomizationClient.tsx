'use client'

import { ChevronLeft, Globe, Image as ImageIcon, Loader2, Palette, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getApplicationById, updateApplication } from '../../../actions'

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6'
const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500'

export function ApplicationManagementidPortalCustomizationClient({ appId, basePath = '/applications' }: { appId: string; basePath?: string }) {
    const router = useRouter()
    const [appName, setAppName] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [form, setForm] = useState({
        branding_color: '#0F53FF',
        logo_url: '',
        portal_title: '',
        portal_description: '',
    })

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getApplicationById(appId)
                if (!data) {
                    router.push(basePath)
                    return
                }
                setAppName(data.name)
                setForm({
                    branding_color: data.branding_color || '#0F53FF',
                    logo_url: data.logo_url || '',
                    portal_title: data.portal_title || '',
                    portal_description: data.portal_description || '',
                })
            } catch {
                toast.error('Failed to load application')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId, router, basePath])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateApplication(appId, { ...form })
            toast.success('Portal settings updated')
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
                    <h1 className="text-lg font-semibold text-slate-900">Portal Customization</h1>
                    <p className="text-sm text-slate-500">Customize the look and feel of your public portal.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    <ChevronLeft className="h-4 w-4" /> Back
                </button>
            </div>

            {/* Branding */}
            <section className={`${cardClass} space-y-5`}>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                        <Palette className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">Branding</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm">
                        <span className="mb-1 block text-slate-600">Brand Color</span>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={form.branding_color}
                                onChange={(e) => setForm({ ...form, branding_color: e.target.value })}
                                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 p-1"
                            />
                            <input
                                type="text"
                                value={form.branding_color}
                                onChange={(e) => setForm({ ...form, branding_color: e.target.value })}
                                className={`${inputClass} font-mono uppercase`}
                            />
                        </div>
                    </label>
                    <label className="block text-sm">
                        <span className="mb-1 block text-slate-600">Logo URL</span>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="url"
                                value={form.logo_url}
                                onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                                placeholder="https://"
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                    </label>
                </div>
            </section>

            {/* SEO */}
            <section className={`${cardClass} space-y-5`}>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                        <Globe className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">SEO Metadata</h2>
                </div>
                <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Portal Title</span>
                    <input
                        type="text"
                        value={form.portal_title}
                        onChange={(e) => setForm({ ...form, portal_title: e.target.value })}
                        placeholder={appName}
                        className={inputClass}
                    />
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block text-slate-600">Description</span>
                    <textarea
                        value={form.portal_description}
                        onChange={(e) => setForm({ ...form, portal_description: e.target.value })}
                        rows={3}
                        className={`${inputClass} resize-none`}
                    />
                </label>
            </section>

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
        </div>
    )
}
