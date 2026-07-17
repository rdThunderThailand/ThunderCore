import { useCallback, useMemo, useState } from 'react'

export interface UsePaginationOptions {
    itemsPerPage?: number
    initialPage?: number
}

export interface UsePaginationResult<T> {
    currentPage: number
    totalPages: number
    paginatedItems: T[]
    setPage: (page: number) => void
    nextPage: () => void
    prevPage: () => void
    goToFirst: () => void
    goToLast: () => void
    canGoNext: boolean
    canGoPrev: boolean
}

/**
 * Hook for managing pagination state and logic
 *
 * @param items - Array of items to paginate
 * @param options - Pagination options
 * @returns Pagination state and controls
 */
export function usePagination<T>(
    items: T[],
    options: UsePaginationOptions = {}
): UsePaginationResult<T> {
    const { itemsPerPage = 10, initialPage = 1 } = options
    const [currentPage, setCurrentPage] = useState(initialPage)

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(items.length / itemsPerPage)),
        [items.length, itemsPerPage]
    )

    // Reset to page 1 if current page exceeds total
    useMemo(() => {
        if (currentPage > totalPages) {
            // eslint-disable-next-line react-hooks/set-state-in-render
            setCurrentPage(1)
        }
    }, [currentPage, totalPages])

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return items.slice(start, start + itemsPerPage)
    }, [items, currentPage, itemsPerPage])

    const setPage = useCallback((page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }, [totalPages])

    const nextPage = useCallback(() => {
        setCurrentPage(p => Math.min(p + 1, totalPages))
    }, [totalPages])

    const prevPage = useCallback(() => {
        setCurrentPage(p => Math.max(p - 1, 1))
    }, [])

    const goToFirst = useCallback(() => {
        setCurrentPage(1)
    }, [])

    const goToLast = useCallback(() => {
        setCurrentPage(totalPages)
    }, [totalPages])

    return {
        currentPage,
        totalPages,
        paginatedItems,
        setPage,
        nextPage,
        prevPage,
        goToFirst,
        goToLast,
        canGoNext: currentPage < totalPages,
        canGoPrev: currentPage > 1
    }
}
