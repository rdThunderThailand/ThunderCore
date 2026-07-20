'use client'

import { Tenant } from '@/types'
import {
    AlertCircle, CheckCircle2, ChevronDown, ChevronLeft, Loader2, Plus, Save,
    Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { deleteTenant, updateTenant } from '../../../actions'

interface OrgSettingsClientProps {
    initialTenant: Tenant
    userRole: string
}

export function OrgSettingsClient({ initialTenant, userRole }: OrgSettingsClientProps) {
    const params = useParams()
    const router = useRouter()
    const tenantId = params.id as string

    const isSuperAdmin = userRole === 'super_admin' || 'company_admin'
    const canEdit = isSuperAdmin || userRole === 'company_admin'

    const [formData, setFormData] = useState({
        name: initialTenant.name,
        email: initialTenant.contactEmail || '',
        website: initialTenant.websiteUrl ? initialTenant.websiteUrl.replace(/^https?:\/\//, '').replace(/\.[^/.]+$/, '') : '',
        websiteProtocol: initialTenant.websiteUrl?.startsWith('http://') ? 'http://' : 'https://',
        websiteSuffix: initialTenant.websiteUrl ? ('.' + initialTenant.websiteUrl.split('.').pop()) : '.com',
        description: initialTenant.description || ''
    })

    const searchParams = useSearchParams()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        if (searchParams.get('created') === 'true') {
            setSuccess('Success! Tenant created successfully.')
            const timer = setTimeout(() => setSuccess(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [searchParams])

    const handleSave = async () => {
        if (!canEdit) {
            setError('Permission denied.')
            return
        }

        if (!formData.name.trim()) {
            setError('Tenant name is required.')
            return
        }

        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const fullWebsiteUrl = formData.website.trim() ? `${formData.websiteProtocol}${formData.website}${formData.websiteSuffix}` : ''

            await updateTenant(tenantId, {
                name: formData.name,
                type: initialTenant.type,
                status: initialTenant.status,
                contact_email: formData.email,
                website_url: fullWebsiteUrl,
                description: formData.description
            })
            setSuccess('Success! Your tenant has been updated.')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            const error = err as Error
            setError(error.message || 'Update failed.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!isSuperAdmin) return

        setIsLoading(true)
        setError(null)

        try {
            await deleteTenant(tenantId)
            router.push('/dashboard/tenants?deleted=true')
        } catch (err) {
            const error = err as Error
            setError(error.message || 'Delete failed.')
            setShowDeleteConfirm(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* Main Settings Card */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-100">
                {/* Header */}
                <div className="mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Tenant Logo</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Update your tenant details and information.</p>
                </div>

                {/* Logo + Form — side by side on desktop */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Logo Upload (Left) */}
                    <div className="flex flex-col items-center lg:min-w-[200px] shrink-0">
                        <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-all group mb-3">
                            <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-1" />
                            <span className="text-xs font-medium text-slate-500 group-hover:text-blue-500">Upload</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{formData.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Recommended: 400x400px</p>
                    </div>

                    {/* Form Fields (Right) */}
                    <div className="flex-1 space-y-5">
                        {/* Tenant Name — full width */}
                        <div className="space-y-1.5">
                            <label htmlFor="org-name" className="block text-sm font-medium text-slate-600">Tenant Name</label>
                            <input
                                id="org-name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-900"
                            />
                        </div>

                        {/* Contact Email + Website URL — side by side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label htmlFor="org-email" className="block text-sm font-medium text-slate-600">Contact Email</label>
                                <input
                                    id="org-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="org-website" className="block text-sm font-medium text-slate-600">Website URL</label>
                                <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                    <div className="px-3 py-3 border-r border-slate-200 flex items-center text-sm text-slate-400 bg-slate-50 shrink-0">
                                        {formData.websiteProtocol} <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                                    </div>
                                    <input
                                        id="org-website"
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="flex-1 px-3 py-3 outline-none text-sm text-slate-900 placeholder:text-slate-400 min-w-0 bg-transparent"
                                        placeholder="Enter websit..."
                                    />
                                    <div className="px-3 py-3 border-l border-slate-200 flex items-center text-sm text-slate-400 bg-slate-50 shrink-0">
                                        {formData.websiteSuffix} <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label htmlFor="org-desc" className="block text-sm font-medium text-slate-600">Description</label>
                            <textarea
                                id="org-desc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                                placeholder="Tell us a little about your tenant..."
                            />
                        </div>

                        {/* Save Button — right aligned */}
                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isLoading || !canEdit}
                                className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone — horizontal layout */}
            {isSuperAdmin && (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Delete Tenant</h3>
                            <p className="text-sm text-slate-500">
                                The tenant can only be deleted once the billing has been canceled or has expired.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2.5 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Tenant
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="p-8 flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900">Are you absolutely sure?</h2>
                                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">
                                    This action will permanently <span className="text-red-600 font-bold">DELETE</span> <br />
                                    <span className="font-semibold text-slate-900">&quot;{formData.name}&quot;</span>.
                                </p>
                            </div>

                            <div className="flex gap-3 w-full pt-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {success && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    <span className="text-sm font-semibold">{success}</span>
                </div>
            )}
        </div>
    )
}
