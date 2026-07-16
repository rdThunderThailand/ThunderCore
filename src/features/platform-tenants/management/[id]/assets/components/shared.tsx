import React from 'react';

export function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
            {children}
        </div>
    )
}

export function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 pt-4 pb-1">
            <div className="text-violet-500">{icon}</div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <div className="flex-1 h-px bg-slate-100 ml-2" />
        </div>
    )
}

export function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
            <style jsx global>{`
                .form-input {
                    width: 100%;
                    padding: 0.875rem 1.5rem;
                    background: rgb(248 250 252);
                    border: 2px solid transparent;
                    border-radius: 1rem;
                    outline: none;
                    transition: all 0.2s;
                    font-weight: 700;
                    font-size: 0.875rem;
                }
                .form-input:focus {
                    border-color: rgb(139 92 246);
                    background: white;
                }
                .form-input::placeholder {
                    color: rgb(203 213 225);
                }
            `}</style>
        </div>
    )
}
