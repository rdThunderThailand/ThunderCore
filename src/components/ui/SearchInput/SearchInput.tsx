'use client'

import { Loader2, Search, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

export interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    debounceMs?: number
    showButton?: boolean
    buttonText?: string
    onSearch?: () => void
    loading?: boolean
    className?: string
}

function SearchInputComponent({
    value,
    onChange,
    placeholder = 'Search...',
    debounceMs = 300,
    showButton = true,
    buttonText = 'Search',
    onSearch,
    loading = false,
    className = ''
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value)

    // Sync external value changes
    useEffect(() => {
        setLocalValue(value)
    }, [value])

    // Debounced onChange
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue)
            }
        }, debounceMs)

        return () => clearTimeout(timer)
    }, [localValue, debounceMs, onChange, value])

    const handleClear = useCallback(() => {
        setLocalValue('')
        onChange('')
    }, [onChange])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch()
        }
    }, [onSearch])

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <div className="flex">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={localValue}
                        onChange={e => setLocalValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 ${showButton ? 'border-r-0 rounded-l-lg' : 'rounded-lg'
                            } focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm`}
                    />
                    {localValue && (
                        <button
                            onClick={handleClear}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {showButton && (
                    <button
                        onClick={onSearch}
                        disabled={loading}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-blue-500 font-medium rounded-r-lg hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            buttonText
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export const SearchInput = React.memo(SearchInputComponent)
