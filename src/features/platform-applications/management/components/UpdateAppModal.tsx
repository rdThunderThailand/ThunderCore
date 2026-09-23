'use client'

import { LayoutGrid, Loader2, Save } from 'lucide-react'

interface UpdateForm {
    name: string
    url: string
}

interface UpdateAppModalProps {
    isOpen: boolean
    onClose: () => void
    formData: UpdateForm
    setFormData: (data: UpdateForm) => void
    onSave: () => void
    isSaving: boolean
}

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500'

export function UpdateAppModal({ isOpen, onClose, formData, setFormData, onSave, isSaving }: UpdateAppModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-4 text-lg font-semibold">Update application</h3>

                <div className="space-y-4">
                    <label className="block text-sm">
                        <span className="mb-1 block text-slate-600">Application Name</span>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={inputClass}
                        />
                    </label>

                    <label className="block text-sm">
                        <span className="mb-1 block text-slate-600">Base URL</span>
                        <div className="relative">
                            <LayoutGrid className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
