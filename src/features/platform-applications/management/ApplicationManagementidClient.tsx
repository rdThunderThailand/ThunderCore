'use client'

import { ApplicationDetails } from '@/types/applications'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getApplicationById, updateApplication } from '../actions'
import { AppActivityLogs } from './components/AppActivityLogs'
import { AppManagementHeader } from './components/AppManagementHeader'
import { AppStatsGrid } from './components/AppStatsGrid'
import { AppUsageCharts } from './components/AppUsageCharts'
// import { UpdateAppModal } from './components/UpdateAppModal'
import { ApiKeySection } from './setting/components/ApiKeySection'

// ponytail: static demo metrics — swap for a stats endpoint when one exists.
const STATS = { totalRequests: 124582, activeUsers: 1240, dbStorage: 450, avgLatency: '45' }
const RECENT_LOGS = [
    { id: '1', event: 'New User Registered', timestamp: '2 minutes ago', status: 'success' as const },
    { id: '2', event: 'Database Backup Completed', timestamp: '1 hour ago', status: 'success' as const },
    { id: '3', event: 'API Authentication Failed', timestamp: '2 hours ago', status: 'error' as const },
    { id: '4', event: 'System Update Initialized', timestamp: '5 hours ago', status: 'warning' as const },
]

export function ApplicationManagementidClient({ appId, basePath = '/applications' }: { appId: string; basePath?: string }) {
    const router = useRouter()
    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    // const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [formData, setFormData] = useState({ name: '', url: '' })

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getApplicationById(appId)
                if (!data) {
                    router.push(basePath)
                    return
                }
                setApp(data)
                setFormData({ name: data.name, url: data.url || '' })
            } catch {
                toast.error('Failed to load application')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId, router, basePath])

    const handleUpdate = async () => {
        if (!formData.name.trim()) return
        setIsSaving(true)
        try {
            await updateApplication(appId, formData)
            setApp((prev) => (prev ? { ...prev, ...formData } : null))
            // setShowUpdateModal(false)
            toast.success('Application updated!')
        } catch {
            toast.error('Update failed')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!app) return null

    return (
        <div className="space-y-6 p-8">
            <AppManagementHeader
                app={{ id: app.id, tenant_id: app.tenant_id ?? '', name: app.name, status: app.status ?? 'inactive', url: app.url ?? undefined }}
            // onUpdateIdentity={() => setShowUpdateModal(true)}
            />

            <ApiKeySection appId={appId} />

            <AppStatsGrid stats={STATS} />


            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AppUsageCharts />
                <AppActivityLogs logs={RECENT_LOGS} />
            </div>

            {/* <UpdateAppModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                formData={formData}
                setFormData={setFormData}
                onSave={handleUpdate}
                isSaving={isSaving}
            /> */}
        </div>
    )
}
