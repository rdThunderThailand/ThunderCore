'use client'

import { Check } from 'lucide-react'

interface PermissionBadgeProps {
    label: string
    active: boolean
    onClick: () => void
    disabled?: boolean
}

export function PermissionBadge({ label, active, onClick, disabled }: PermissionBadgeProps) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            type="button"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all border-2
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${active
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : 'bg-slate-50 border-slate-50 text-slate-300'}`}
        >
            {active && <Check className="w-2.5 h-2.5" />}
            {label}
        </button>
    )
}
