'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { ReactNode } from 'react'

export interface TableColumn<T> {
    key: keyof T | string
    header: string
    width?: string
    align?: 'left' | 'center' | 'right'
    sortable?: boolean
    render?: (item: T, index: number) => ReactNode
}

export interface TableProps<T> {
    data: T[]
    columns: TableColumn<T>[]
    keyExtractor: (item: T) => string
    selectable?: boolean
    selectedIds?: Set<string>
    onSelectionChange?: (ids: Set<string>) => void
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    onSort?: (column: string) => void
    emptyMessage?: string
    loading?: boolean
    rowClassName?: (item: T, index: number) => string
    onRowClick?: (item: T) => void
}

function TableComponent<T>({
    data,
    columns,
    keyExtractor,
    selectable = false,
    selectedIds = new Set(),
    onSelectionChange,
    sortColumn,
    sortDirection = 'asc',
    onSort,
    emptyMessage = 'No data found.',
    loading = false,
    rowClassName,
    onRowClick
}: TableProps<T>) {
    const allSelected = data.length > 0 && data.every(item => selectedIds.has(keyExtractor(item)))

    const handleSelectAll = () => {
        if (!onSelectionChange) return
        if (allSelected) {
            onSelectionChange(new Set())
        } else {
            onSelectionChange(new Set(data.map(keyExtractor)))
        }
    }

    const handleSelectRow = (id: string) => {
        if (!onSelectionChange) return
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        onSelectionChange(newSelected)
    }

    const getCellValue = (item: T, column: TableColumn<T>): ReactNode => {
        if (column.render) {
            return column.render(item, data.indexOf(item))
        }
        const value = (item as Record<string, unknown>)[column.key as string]
        return value as ReactNode
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        {selectable && (
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                    className="rounded border-slate-300"
                                />
                            </th>
                        )}
                        {columns.map(col => (
                            <th
                                key={String(col.key)}
                                style={{ width: col.width }}
                                className={`px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide ${col.align === 'center' ? 'text-center' :
                                        col.align === 'right' ? 'text-right' : 'text-left'
                                    } ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''}`}
                                onClick={() => col.sortable && onSort?.(String(col.key))}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {col.header}
                                    {col.sortable && sortColumn === col.key && (
                                        sortDirection === 'asc'
                                            ? <ChevronUp className="w-3 h-3" />
                                            : <ChevronDown className="w-3 h-3" />
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length + (selectable ? 1 : 0)}
                                className="p-8 text-center text-slate-400 text-sm"
                            >
                                Loading...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (selectable ? 1 : 0)}
                                className="p-8 text-center text-slate-400 text-sm"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => {
                            const id = keyExtractor(item)
                            return (
                                <tr
                                    key={id}
                                    onClick={() => onRowClick?.(item)}
                                    className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors group ${onRowClick ? 'cursor-pointer' : ''
                                        } ${rowClassName?.(item, index) || ''}`}
                                >
                                    {selectable && (
                                        <td className="p-4" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(id)}
                                                onChange={() => handleSelectRow(id)}
                                                className="rounded border-slate-300"
                                            />
                                        </td>
                                    )}
                                    {columns.map(col => (
                                        <td
                                            key={String(col.key)}
                                            className={`px-4 py-4 ${col.align === 'center' ? 'text-center' :
                                                    col.align === 'right' ? 'text-right' : ''
                                                }`}
                                        >
                                            {getCellValue(item, col)}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}

export const Table = React.memo(TableComponent) as typeof TableComponent
