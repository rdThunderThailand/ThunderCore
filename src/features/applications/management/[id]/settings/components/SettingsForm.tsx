'use client'

import { LayoutGrid, Loader2, Save } from 'lucide-react'

interface SettingsFormProps {
    formData: {
        name: string
        url: string
        logo_url: string | null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData: (data: any) => void
    onSave: () => Promise<void>
    isSaving: boolean
}

export function SettingsForm({ formData, setFormData, onSave, isSaving }: SettingsFormProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Application Settings</h3>
                <p className="text-slate-400 text-sm mt-1">Update your application details and information.</p>
            </div>

            <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
                {/* Logo Placeholder */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden relative group cursor-pointer">
                        {formData.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={formData.logo_url}
                                alt="Logo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <LayoutGrid className="w-10 h-10 text-slate-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">Change</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Tenant Logo</p>
                        <p className="text-xs text-slate-400 mt-1">Recommended: 400x400px</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Application Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Application URL</label>
                            <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-500 transition-all">
                                <span className="bg-slate-50 px-3 py-2.5 text-slate-500 text-sm font-medium border-r border-slate-200">https://</span>
                                <input
                                    type="text"
                                    value={formData.url.replace('https://', '')}
                                    onChange={(e) => setFormData({ ...formData, url: `https://${e.target.value}` })}
                                    className="w-full px-4 py-2.5 bg-white outline-none text-sm font-medium text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-[#0F53FF] text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 flex items-center gap-2 text-sm disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
