'use client'

import { X } from 'lucide-react'
import React, { ReactNode, useCallback, useEffect } from 'react'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    titleIcon?: ReactNode
    children: ReactNode
    footer?: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closeOnOverlayClick?: boolean
    closeOnEscape?: boolean
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
}

function ModalComponent({
    isOpen,
    onClose,
    title,
    titleIcon,
    children,
    footer,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true
}: ModalProps) {
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
            onClose()
        }
    }, [onClose, closeOnEscape])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleEscape])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
            onClick={closeOnOverlayClick ? onClose : undefined}
        >
            <div
                className={`bg-white w-full ${sizeClasses[size]} rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            {titleIcon && (
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    {titleIcon}
                                </div>
                            )}
                            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Close modal"
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t border-slate-100 flex items-center gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export const Modal = React.memo(ModalComponent)
