'use client'

import { AlertCircle, Loader2, Trash2 } from 'lucide-react'

interface DeleteOrgConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    isDeleting: boolean
}

export function DeleteOrgConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting
}: DeleteOrgConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
                <div className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-900">Are you absolutely sure?</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            This action cannot be undone. It will permanently <span className="text-red-600 font-bold">DELETE</span> your tenant and remove your data from our servers.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-[#ff4f4f] text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm shadow-sm shadow-red-200 flex items-center gap-2"
                    >
                        {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
