'use client'

import { useTranslation } from '@/i18n/context';
import { Tenant } from '@/types';
import {
    AlertCircle, AppWindow, CheckCircle2, ChevronLeft,
    ChevronRight, LayoutGrid, Loader2, MessageCircle, Plus, RotateCw, Search, Timer, Trash2, Users, X, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useDeferredValue } from 'react';
import { toast } from 'sonner';
import { createTenant, deleteTenant, updateTenant } from './actions';

interface TenantsClientProps {
    initialTenants: Tenant[]
    userRole: string
    usageStats?: {
        totalTenants: number
        totalMembers: number
        totalApps: number
        activeTenants: number
    }
}

interface DropdownMenuProps {
    tenantId: string
    isOpen: boolean
    onToggle: (e: React.MouseEvent) => void
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
    isSuperAdmin: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DropdownMenu({ tenantId, isOpen, onToggle, onClose, onEdit, onDelete, isSuperAdmin }: DropdownMenuProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [position, setPosition] = useState({ top: 0, right: 0 })

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            })
        }
    }, [isOpen])

    return (
        <div className="relative">
            {/* Using a simple 'Action' text or simplified icon based on design, defaulting to consistent menu for safety */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors"
            >
                Delete
            </button>
        </div>
    )
}


export function TenantsClient({ initialTenants, userRole, usageStats }: TenantsClientProps) {
    const router = useRouter()
    const { t } = useTranslation()
    const [orgs, setOrgs] = useState<Tenant[]>(initialTenants)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOrg, setEditingOrg] = useState<Tenant | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const [currentPage, setCurrentPage] = useState(1)
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)

    useEffect(() => {
        if (searchParams.get('deleted') === 'true') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowDeleteSuccess(true)
            const timer = setTimeout(() => setShowDeleteSuccess(false), 1500)
            router.replace('/tenants', { scroll: false })
            return () => clearTimeout(timer)
        }
    }, [searchParams, router])

    const [selectedOrgs, setSelectedOrgs] = useState<string[]>([])

    const toggleSelectAll = () => {
        if (selectedOrgs.length === paginatedOrgs.length) {
            setSelectedOrgs([])
        } else {
            setSelectedOrgs(paginatedOrgs.map(org => org.id))
        }
    }

    const toggleSelectOrg = (tenantId: string) => {
        if (selectedOrgs.includes(tenantId)) {
            setSelectedOrgs(selectedOrgs.filter(id => id !== tenantId))
        } else {
            setSelectedOrgs([...selectedOrgs, tenantId])
        }
    }

    // ... existing initialization ...
    const isSuperAdmin = userRole === 'super_admin' || 'company_admin'

    const handleBulkDelete = async () => {
        if (!isSuperAdmin) return
        setIsLoading(true)
        setError(null)

        try {
            // Sequential delete mostly for safety or parallel for speed
            await Promise.all(selectedOrgs.map(id => deleteTenant(id)))

            setOrgs(orgs.filter(o => !selectedOrgs.includes(o.id)))
            setSelectedOrgs([])
            setDeleteConfirm(null)
            toast.success(`${selectedOrgs.length} tenants deleted successfully.`)
            setShowDeleteSuccess(true)
            setTimeout(() => setShowDeleteSuccess(false), 1500)
        } catch (err) {
            const error = err as Error
            setError(error.message || 'One or more deletions failed.')
            toast.error(error.message || 'Failed to delete tenants.')
        } finally {
            setIsLoading(false)
        }
    }

    const [formData, setFormData] = useState({
        name: '',
        type: 'enterprise' as Tenant['type'],
        status: 'active' as Tenant['status']
    })

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Tenant name is required.')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            if (editingOrg) {
                const updated = await updateTenant(editingOrg.id, formData)
                setOrgs(orgs.map(o => o.id === editingOrg.id ? updated : o))
                toast.success('Tenant updated successfully.')
                setIsModalOpen(false)
            } else {
                if (!isSuperAdmin) {
                    setError('Permission denied.')
                    setIsLoading(false)
                    return
                }
                const newOrg = await createTenant(formData)
                setOrgs([newOrg, ...orgs])
                setIsModalOpen(false)
                setFormData({ name: '', type: 'enterprise', status: 'active' })
                router.push(`/tenants/management/${newOrg.id}/settings?created=true`)
            }
        } catch (err) {
            const error = err as Error
            setError(error.message || 'An error occurred.')
            toast.error(error.message || 'Failed to save tenant.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (tenantId: string) => {
        if (!isSuperAdmin) return

        setIsLoading(true)
        setError(null)

        try {
            await deleteTenant(tenantId)
            setOrgs(orgs.filter(o => o.id !== tenantId))
            setDeleteConfirm(null)
            toast.success('Tenant deleted successfully.')
            setShowDeleteSuccess(true)
            setTimeout(() => setShowDeleteSuccess(false), 1500)
        } catch (err) {
            const error = err as Error
            setError(error.message || 'An error occurred.')
            toast.error(error.message || 'Failed to delete tenant.')
        } finally {
            setIsLoading(false)
        }
    }

    const openModal = (org?: Tenant) => {
        if (org) {
            setEditingOrg(org)
            setFormData({ name: org.name, type: org.type, status: org.status })
        } else {
            setEditingOrg(null)
            setFormData({ name: '', type: 'enterprise', status: 'active' })
        }
        setIsModalOpen(true)
        setError(null)
    }

    const deferredSearchTerm = useDeferredValue(searchTerm)
    const filteredOrgs = orgs.filter(o => o.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()))

    // Pagination
    const itemsPerPage = 8
    const totalPages = Math.ceil(filteredOrgs.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedOrgs = filteredOrgs.slice(startIndex, startIndex + itemsPerPage)

    // Calculate trends / stats (Mock+Real hybrid)
    const stats = [
        {
            label: t('org.totalTenants'),
            value: usageStats?.totalTenants || orgs.length,
            trend: '+12.5% from last month',
            icon: MessageCircle,
            color: 'bg-blue-500',
            iconColor: 'bg-blue-500'
        },
        {
            label: t('org.active'),
            value: usageStats?.activeTenants || 0,
            trend: '-2% since yesterday',
            icon: RotateCw,
            color: 'bg-orange-400',
            iconColor: 'text-orange-400'
        },
        {
            label: t('org.totalApps'),
            value: usageStats?.totalApps || 0,
            trend: '+12 since last hour',
            icon: Timer,
            color: 'bg-red-500',
            iconColor: 'bg-red-500'
        },
        {
            label: t('org.totalMembers'),
            value: usageStats?.totalMembers || 0,
            trend: '+8.4% from last week',
            icon: CheckCircle2,
            color: 'bg-green-500',
            iconColor: 'bg-green-500'
        },
    ]

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="w-full max-w-full pb-24 lg:pb-12">


            <div className="max-w-7xl mx-auto p-4 lg:p-6 pb-8 lg:pb-12 space-y-6 lg:space-y-8 animate-in fade-in duration-500">

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 lg:h-40 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start">
                                <span className="text-slate-500 font-bold text-xs lg:text-sm tracking-wide truncate">{stat.label}</span>
                                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${i === 1 ? 'border-2 border-orange-400' : stat.color} shrink-0`}>
                                    <stat.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${i === 1 ? 'text-orange-400' : 'text-white'}`} />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl lg:text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</div>
                                <div className="text-[10px] font-bold text-slate-400 mt-1 truncate">{stat.trend}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-4 lg:p-6 flex flex-col overflow-hidden">

                    {/* Search & Actions */}
                    <div className="flex flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('org.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Mobile: Create Button (Icon only or condensed) */}
                        {isSuperAdmin && (
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('org.create')}</span>
                                <span className="sm:hidden">{t('org.create')}</span>
                            </button>
                        )}
                    </div>

                    {/* Bulk Actions Row (if active) */}
                    {selectedOrgs.length > 0 && isSuperAdmin && (
                        <div className="mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={() => setDeleteConfirm('bulk')}
                                className="px-4 py-2 bg-red-50 text-red-600 font-semibold text-xs rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-3 h-3" />
                                {t('common.delete')} ({selectedOrgs.length})
                            </button>
                        </div>
                    )}

                    {/* Table / List */}
                    <div className="flex-1 overflow-x-auto w-full max-w-full">
                        <table className="w-full min-w-[600px] lg:min-w-0">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-3 px-4 text-left w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4"
                                            checked={paginatedOrgs.length > 0 && paginatedOrgs.every(org => selectedOrgs.includes(org.id))}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide w-16">{t('table.image')}</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide">{t('table.tenant')}</th>
                                    <th className="hidden md:table-cell py-3 px-4 text-center text-xs font-bold text-slate-900 uppercase tracking-wide">{t('table.memberCount')}</th>
                                    <th className="hidden md:table-cell py-3 px-4 text-center text-xs font-bold text-slate-900 uppercase tracking-wide">{t('table.appCount')}</th>
                                    <th className="hidden lg:table-cell py-3 px-4 text-right text-xs font-bold text-slate-900 uppercase tracking-wide">{t('table.createdOn')}</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-900 uppercase tracking-wide">{t('table.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedOrgs.map((org) => {
                                    // Format the actual creation date
                                    const createdDate = new Date(org.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                    const isSelected = selectedOrgs.includes(org.id)

                                    return (
                                        <tr
                                            key={org.id}
                                            onClick={() => router.push(`/tenants/management/${org.id}/settings`)}
                                            className={`group transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOrg(org.id)}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold border border-blue-200">
                                                    {org.name.charAt(0)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm font-medium text-slate-700 block truncate max-w-[150px] sm:max-w-[250px] lg:max-w-xs">{org.name}</span>
                                            </td>
                                            <td className="hidden md:table-cell py-4 px-4 text-center">
                                                <span className="text-sm text-slate-600">{org.memberCount}</span>
                                            </td>
                                            <td className="hidden md:table-cell py-4 px-4 text-center">
                                                <span className="text-sm text-slate-600">{org.appCount}</span>
                                            </td>
                                            <td className="hidden lg:table-cell py-4 px-4 text-right">
                                                <span className="text-sm text-slate-500">{createdDate}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDeleteConfirm(org.id)
                                                    }}
                                                    className="text-sm font-medium text-blue-500 hover:text-blue-700 hover:underline"
                                                >
                                                    {t('common.delete')}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer - Simplified for mobile */}
                    <div className="border-t border-slate-100 pt-6 mt-2 flex items-center justify-between">
                        <div className="text-sm text-slate-500 font-medium">
                            <span className="hidden sm:inline">{t('common.page')} </span>{currentPage} / {Math.max(1, totalPages)}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="hidden sm:flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === i + 1
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                            } font-medium text-sm transition-all`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation (Mobile Only) */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 pb-safe">
                <Link href="/tenants" className="flex flex-col items-center gap-1 text-blue-600">
                    <LayoutGrid className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{t('sidebar.tenants')}</span>
                </Link>
                <Link href="/applications" className="flex flex-col items-center gap-1 text-slate-400">
                    <AppWindow className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{t('sidebar.applications')}</span>
                </Link>
                <Link href="/users" className="flex flex-col items-center gap-1 text-slate-400">
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{t('sidebar.users')}</span>
                </Link>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden">

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{t('modal.createOrg')}</h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Only Name Field showing based on screenshot */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">{t('modal.orgName')}</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                        placeholder={t('modal.enterOrgName')}
                                    />
                                </div>

                                {/* Hidden default fields if needed, or just removed from UI since screenshot doesn't show them */}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 px-4 bg-white border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                {t('modal.createOrg')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="p-6 flex gap-4">
                            <div className="shrink-0">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-amber-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {deleteConfirm === 'bulk'
                                        ? `${t('common.delete')} ${selectedOrgs.length} ${t('sidebar.tenants')}?`
                                        : t('modal.deleteConfirm')}
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {deleteConfirm === 'bulk'
                                        ? t('modal.deleteOrgDesc')
                                        : t('modal.deleteOrgDesc')}
                                </p>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={() => deleteConfirm === 'bulk' ? handleBulkDelete() : handleDelete(deleteConfirm)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm shadow-red-500/20"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Success Toast */}
            {showDeleteSuccess && (
                <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-4 bg-white rounded-2xl shadow-2xl border border-emerald-100 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">{t('common.success')}</h4>
                        <p className="text-xs text-slate-500 font-medium">{t('org.deleteSuccess')}</p>
                    </div>
                    <button
                        onClick={() => setShowDeleteSuccess(false)}
                        className="ml-2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
