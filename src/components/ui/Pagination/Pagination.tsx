'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useMemo } from 'react'

export interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showPageNumbers?: boolean
    maxVisiblePages?: number
}

function PaginationComponent({
    currentPage,
    totalPages,
    onPageChange,
    showPageNumbers = true,
    maxVisiblePages = 5
}: PaginationProps) {
    const pages = useMemo(() => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const half = Math.floor(maxVisiblePages / 2)
        let start = Math.max(1, currentPage - half)
        // eslint-disable-next-line prefer-const
        let end = Math.min(totalPages, start + maxVisiblePages - 1)

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1)
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }, [currentPage, totalPages, maxVisiblePages])

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between border-t border-slate-50 pt-6">
            <p className="text-sm text-slate-500 font-medium">
                Page {currentPage} of {Math.max(1, totalPages)}
            </p>
            <div className="flex items-center gap-1">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {showPageNumbers && pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export const Pagination = React.memo(PaginationComponent)
