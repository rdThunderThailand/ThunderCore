'use client'

import { useTranslation } from '@/i18n/context'
import { Loader2, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    isLoading: boolean
    // What's being deleted, e.g. a name/email for a single user or "3 selected users" for bulk.
    targetLabel?: string
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, isLoading, targetLabel }: DeleteConfirmModalProps) {
    const [mounted, setMounted] = useState(false)
    const { t } = useTranslation()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true) }, [])

    if (!isOpen || !mounted) return null

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={isLoading ? undefined : onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900">{t('modal.deleteConfirm')}</h3>
                            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                                {t('modal.deleteUserDesc')}
                                {targetLabel && (
                                    <>
                                        {' '}<span className="font-semibold text-slate-700">{targetLabel}</span>
                                    </>
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
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
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
