'use client'

import { SearchInputProps } from '@/types'
import { Search } from 'lucide-react'

export function SearchInput({ value, onChange }: SearchInputProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
                type="text"
                placeholder="Search by name or email..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none w-full md:w-80 transition-all text-sm"
            />
        </div>
    )
}
