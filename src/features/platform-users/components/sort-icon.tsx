'use client'

import { Profile } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function SortIcon({ column, sortConfig }: {
    column: keyof Profile,
    sortConfig: { key: keyof Profile, direction: 'asc' | 'desc' } | null
}) {
    if (sortConfig?.key !== column) return (
        <div className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity">
            <ChevronUp className="w-4 h-4" />
        </div>
    )
    return sortConfig.direction === 'asc'
        ? <ChevronUp className="w-4 h-4 text-violet-600" />
        : <ChevronDown className="w-4 h-4 text-violet-600" />
}
