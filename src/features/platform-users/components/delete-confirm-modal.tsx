'use client'

import { useTranslation } from '@/i18n/context'
import { AlertCircle, Loader2, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    isLoading: boolean
    userName?: string
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, isLoading, userName }: DeleteConfirmModalProps) {
    const [mounted, setMounted] = useState(false)
    const { t } = useTranslation()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true) }, [])

    if (!isOpen || !mounted) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900">{t('modal.deleteConfirm')}</h3>
                            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                                {t('modal.deleteUserDesc').split('DELETE').map((part, i) =>
                                    i === 0
                                        ? <span key={i}>{part}<span className="text-red-500 font-semibold">DELETE</span></span>
                                        : <span key={i}>{part}{userName ? <><span className="font-medium text-slate-700"> {userName}</span></> : ''}</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                        {t('modal.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {t('modal.delete')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
