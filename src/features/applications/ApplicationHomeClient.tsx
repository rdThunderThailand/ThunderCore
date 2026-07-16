'use client'

// import { SearchInput } from '@/components/ui'
// import { TableSkeleton } from '@/components/ui/table-skeleton'
import { useTranslation } from '@/i18n/context'
import { SystemApplication } from '@/models/Application'
import { UserRole } from '@/types/auth'
import { supabase } from '@/utils/supabase/client'
import { getUserRole } from '@/utils/supabase/rbac'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Check, LayoutGrid, Loader2, Plus, X, AppWindow } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
    createSystemApplication,
    createTenantApplication,
    deleteSystemApplication, getAllApplications, getTenantsForSelect
} from './actions'
import { ApplicationTable, CreateApplicationModal } from './components'

interface Stats {
    total: number
    active: number
    thisMonth: number
}

export function ApplicationHomeClient() {
    const router = useRouter()
    const [apps, setApps] = useState<SystemApplication[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, active: 0, thisMonth: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [role, setRole] = useState<UserRole>('operator')
    const { t } = useTranslation()

    // Load data on mount
    useEffect(() => {
        loadData()
    }, [])

    // Auto-clear success message
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const userRes = await supabase.auth.getUser()
            if (userRes.data.user) {
                const fetchedRole = await getUserRole(supabase, userRes.data.user)
                setRole(fetchedRole)

                const appsData = await getAllApplications()
                setApps(appsData)

                // Tenants for the create modal's owner picker (empty on failure — system-app default still works)
                const tenantList = await getTenantsForSelect()
                setTenants(tenantList)

                // Calculate stats
                const now = new Date()
                const thisMonthCount = appsData.filter(app => {
                    const d = new Date(app.created_at)
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length

                setStats({
                    total: appsData.length,
                    active: appsData.filter(a => a.status === 'active').length,
                    thisMonth: thisMonthCount
                })
            }
        } catch (err) {
            console.error('Error loading data:', err)
            setError('Failed to load applications')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateApp = useCallback(async (name: string, tenantId: string | null) => {
        setIsSubmitting(true)
        setError(null)

        try {
            // tenantId set → tenant-owned app (binds applications.tenant_id); null → system app.
            const newApp = tenantId
                ? await createTenantApplication(tenantId, {
                    name,
                    url: '',
                    description: '',
                    environment: 'production'
                })
                : await createSystemApplication({
                    name,
                    url: '',
                    description: '',
                    environment: 'production'
                })

            router.push(`/app-registry/management/${newApp.id}/settings`)
            setApps(prev => [newApp, ...prev])
            setIsCreateModalOpen(false)
            setSuccess('Application created successfully! Redirecting...')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }, [router])

    const handleDelete = useCallback(async (appId: string) => {
        if (!confirm('Are you sure you want to delete this application?')) return

        try {
            await deleteSystemApplication(appId)
            setApps(prev => prev.filter(a => a.id !== appId))
            setStats(prev => ({ ...prev, total: prev.total - 1 }))
            setSuccess('Application deleted successfully')
        } catch (err) {
            setError((err as Error).message)
        }
    }, [])

    if (isLoading) {
        return (
            <div className="flex-1 w-full bg-[#F8F9FC] min-h-screen pt-4">
                {/* <TableSkeleton
                    title="Loading Applications..."
                    description="Please wait while we fetch the application data and statistics."
                    icon={AppWindow}
                    hasStats={true}
                /> */}
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 min-h-screen font-sans text-slate-900">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-4">{t('app.totalApplications')}</p>
                            <h2 className="text-4xl font-bold text-slate-900">{stats.total}</h2>
                            <p className="text-slate-400 text-xs mt-1 font-medium">{t('app.allTime')}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <LayoutGrid className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium mb-4">{t('app.createdApplications')}</p>
                            <h2 className="text-4xl font-bold text-slate-900">{stats.thisMonth}</h2>
                            <p className="text-slate-400 text-xs mt-1 font-medium">
                                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.
                            </p>
                        </div>
                        <div className="bg-[#4ADE80] p-3 rounded-xl">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                {/* Actions Row */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    {/* <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={t('app.searchByApp')}
                        className="w-full md:w-96"
                    /> */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full md:w-auto px-6 py-2.5 bg-[#0F53FF] text-white font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" />
                        {t('app.createApp')}
                    </button>
                </div>

                {/* Table */}
                <ApplicationTable
                    applications={apps}
                    searchTerm={searchTerm}
                    onDelete={handleDelete}
                />
            </div>

            {/* Create Modal */}
            <CreateApplicationModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateApp}
                isSubmitting={isSubmitting}
                tenants={tenants}
            />

            {/* Toast Notifications */}
            {error && (
                <div className="fixed bottom-8 right-8 bg-white border border-red-100 text-red-600 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
                    <X className="w-5 h-5" />
                    <p className="font-medium">{error}</p>
                </div>
            )}
            {success && (
                <div className="fixed bottom-8 right-8 bg-white border border-green-100 text-green-600 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
                    <Check className="w-5 h-5" />
                    <p className="font-medium">{success}</p>
                </div>
            )}
        </div>
    )
}