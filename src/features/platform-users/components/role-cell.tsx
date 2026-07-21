'use client'

import { useEffect, useRef, useState } from 'react'

export type RoleValue = 'super_admin' | 'company_admin' | 'guest'

export interface RoleOption {
    value: RoleValue
    label: string
    badgeClass: string
}

export const ROLE_OPTIONS: RoleOption[] = [
    { value: 'super_admin', label: 'Super Admin', badgeClass: 'bg-green-50 border-green-200 text-green-700' },
    { value: 'company_admin', label: 'Company Admin', badgeClass: 'bg-blue-50 border-blue-200 text-blue-700' },
    { value: 'guest', label: 'Guest', badgeClass: 'bg-slate-100 border-slate-200 text-slate-600' },
]

// Any role string that isn't one of the known buckets falls back to Trial Admin for display.
export const getRoleDisplay = (roleStr: string): RoleOption => {
    return ROLE_OPTIONS.find((option) => option.value === roleStr) || ROLE_OPTIONS[2]
}

interface RoleCellProps {
    role: string
    disabled?: boolean
    onRequestChange: (nextRole: RoleValue) => void
}

export function RoleCell({ role, disabled, onRequestChange }: RoleCellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const current = getRoleDisplay(role)

    useEffect(() => {
        if (!isOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const handleSelect = (option: RoleOption) => {
        setIsOpen(false)
        if (option.value !== current.value) {
            onRequestChange(option.value)
        }
    }

    return (
        <div className="relative inline-block text-left" ref={containerRef} onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${current.badgeClass}`}
            >
                {current.label}
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {ROLE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${option.value === current.value ? 'text-blue-600 font-semibold' : 'text-slate-700'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
