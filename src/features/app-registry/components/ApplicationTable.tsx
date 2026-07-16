'use client'

import { Pagination, Table, TableColumn } from '@/components/ui'
import { usePagination } from '@/hooks'
import { useTranslation } from '@/i18n/context'
import { SystemApplication } from '@/models/Application'
import { Globe } from 'lucide-react'
import Link from 'next/link'
import { memo, useMemo, useDeferredValue } from 'react'

interface ApplicationTableProps {
    applications: SystemApplication[]
    searchTerm: string
    onDelete: (id: string) => void
    itemsPerPage?: number
}

function ApplicationTableComponent({
    applications,
    searchTerm,
    onDelete,
    itemsPerPage = 8
}: ApplicationTableProps) {
    const { t } = useTranslation()
    const deferredSearchTerm = useDeferredValue(searchTerm)

    // Filter apps by search term
    const filteredApps = useMemo(() => {
        if (!deferredSearchTerm) return applications
        return applications.filter(app =>
            app.name.toLowerCase().includes(deferredSearchTerm.toLowerCase())
        )
    }, [applications, deferredSearchTerm])

    // Use pagination hook
    const {
        currentPage,
        totalPages,
        paginatedItems,
        setPage
    } = usePagination(filteredApps, { itemsPerPage })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const columns: TableColumn<SystemApplication>[] = useMemo(() => [
        {
            key: 'image',
            header: t('table.image'),
            render: (app) => (
                <Link
                    href={`/app-registry/management/${app.id}/`}
                    className="block w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden hover:bg-slate-200 transition-colors"
                >
                    <Globe className="w-4 h-4" />
                </Link>
            )
        },
        {
            key: 'name',
            header: t('sidebar.application'),
            render: (app) => (
                <Link
                    href={`/app-registry/management/${app.id}/`}
                    className="text-sm font-medium text-slate-700 hover:text-blue-600 hover:underline block"
                >
                    {app.name}
                </Link>
            )
        },
        {
            key: 'url',
            header: t('app.url'),
            render: (app) => (
                <span className="text-sm text-slate-500">{app.url || '-'}</span>
            )
        },
        {
            key: 'org_subscriptions_count',
            header: t('app.subscribedOrgs'),
            align: 'center',
            render: (app) => (
                <span className="text-sm font-medium text-slate-700">
                    {app.org_subscriptions_count || 0}
                </span>
            )
        },
        {
            key: 'created_at',
            header: t('table.createdOn'),
            render: (app) => (
                <span className="text-sm text-slate-500">{formatDate(app.created_at)}</span>
            )
        },
        {
            key: 'actions',
            header: t('table.action'),
            align: 'right',
            render: (app) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(app.id)
                    }}
                    className="text-sm font-medium text-blue-500 hover:text-blue-700 hover:underline"
                >
                    {t('common.delete')}
                </button>
            )
        }
    ], [onDelete, t])

    return (
        <>
            <Table
                data={paginatedItems}
                columns={columns}
                keyExtractor={(app) => app.id}
                selectable
                emptyMessage={t('app.noApps')}
            />
            <div className="mt-6">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </>
    )
}

export const ApplicationTable = memo(ApplicationTableComponent)
