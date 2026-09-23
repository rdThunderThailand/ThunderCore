'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
    /** Current page (1-indexed) */
    page: number
    /** Total number of pages */
    totalPages: number
    onChange: (page: number) => void
    /** Max page buttons to show (default 5) */
    maxButtons?: number
    className?: string
}

export function Pagination({ page, totalPages, onChange, maxButtons = 5, className = '' }: PaginationProps) {
    if (totalPages <= 1) return null

    const half = Math.floor(maxButtons / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPages, start + maxButtons - 1)
    if (end - start + 1 < maxButtons) {
        start = Math.max(1, end - maxButtons + 1)
    }

    const pages: (number | '...')[] = []
    if (start > 1) {
        pages.push(1)
        if (start > 2) pages.push('...')
    }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...')
        pages.push(totalPages)
    }

    return (
        <div className={`flex items-center justify-end gap-1 pt-3 border-t border-slate-100 ${className}`}>
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm select-none">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-sm transition-colors ${
                            p === page
                                ? 'bg-blue-600 text-white font-medium'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    )
}

/**
 * Utility: slice an array to the current page.
 * @example
 * const pageItems = paginate(filteredItems, page, PAGE_SIZE)
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
}

/**
 * Utility: compute total pages.
 */
export function calcTotalPages(itemCount: number, pageSize: number): number {
    return Math.max(1, Math.ceil(itemCount / pageSize))
}
