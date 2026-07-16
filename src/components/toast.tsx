'use client'

import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

interface Toast {
    id: number
    message: string
    type?: 'success' | 'error'
}

interface ToastContextValue {
    showToast: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } })

export function useToast() {
    return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3500)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container - bottom center */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="flex items-center gap-2.5 pl-3 pr-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-full shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300"
                    >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${toast.type === 'error' ? 'bg-red-400' : 'bg-violet-400'}`} />
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
