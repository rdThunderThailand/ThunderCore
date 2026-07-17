import { useCallback, useState } from 'react'
import { useDebounce } from './useDebounce'

export interface UseSearchOptions {
    debounceMs?: number
}

export interface UseSearchResult {
    searchTerm: string
    debouncedSearchTerm: string
    setSearchTerm: (term: string) => void
    clearSearch: () => void
    isSearching: boolean
}

/**
 * Hook for managing search state with debouncing
 *
 * @param options - Search options
 * @returns Search state and controls
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
    const { debounceMs = 300 } = options
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)

    const clearSearch = useCallback(() => {
        setSearchTerm('')
    }, [])

    // isSearching is true when the user has typed but debounce hasn't settled
    const isSearching = searchTerm !== debouncedSearchTerm

    return {
        searchTerm,
        debouncedSearchTerm,
        setSearchTerm,
        clearSearch,
        isSearching
    }
}
