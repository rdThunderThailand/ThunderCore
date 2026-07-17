'use client'

import { useTranslation } from '@/i18n/context'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
    isLoading?: boolean
    title?: string
    description?: string
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title = 'Are you absolutely sure?',
    description = 'Are you sure you want to proceed?'
}: ConfirmModalProps) {
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
                className="bg-white w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Body */}
                <div className="p-6 pb-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{description}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <X className="w-3.5 h-3.5" />
                        {t('modal.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        {t('modal.confirm')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
