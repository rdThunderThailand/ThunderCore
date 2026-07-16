'use client'

import { ApplicationDetails } from '@/models/Application'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getApplicationById, updateApplication } from './actions'
import { ApiKeyCard } from './components/ApiKeyCard'
import { AppActivityLogs } from './components/AppActivityLogs'
import { AppManagementHeader } from './components/AppManagementHeader'
import { AppStatsGrid } from './components/AppStatsGrid'
import { AppUsageCharts } from './components/AppUsageCharts'
import { ScenarioBroadcastCard } from './components/ScenarioBroadcastCard'
import { UpdateAppModal } from './components/UpdateAppModal'

export function ApplicationManagementidClient() {
    const params = useParams()
    const router = useRouter()
    const appId = params.id as string

    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showApiKey, setShowApiKey] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        url: ''
    })

    useEffect(() => {
        loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const data = await getApplicationById(appId)
            if (!data) {
                router.push('/dashboard/application')
                return
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setApp(data as any) // Typecast for now if api_key is missing in type
            setFormData({
                name: data.name,
                url: data.url || ''
            })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('Failed to load application')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyKey = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiKey = (app as any)?.api_key
        if (!apiKey) return
        navigator.clipboard.writeText(apiKey)
        setSuccess('API Key copied to clipboard!')
        setTimeout(() => setSuccess(null), 3000)
    }

    const handleUpdate = async () => {
        if (!formData.name.trim()) return

        try {
            setIsSaving(true)
            await updateApplication(appId, formData)
            setApp(prev => prev ? { ...prev, ...formData } : null)
            setShowUpdateModal(false)
            setSuccess('Application updated!')
            setTimeout(() => setSuccess(null), 3000)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('Update failed')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
        )
    }

    if (!app) return null

    const statsData = {
        totalRequests: 124582,
        activeUsers: 1240,
        dbStorage: 450,
        avgLatency: '45'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentLogs: any[] = [
        { id: '1', event: 'New User Registered', timestamp: '2 minutes ago', status: 'success' },
        { id: '2', event: 'Database Backup Completed', timestamp: '1 hour ago', status: 'success' },
        { id: '3', event: 'API Authentication Failed', timestamp: '2 hours ago', status: 'error' },
        { id: '4', event: 'System Update Initialized', timestamp: '5 hours ago', status: 'warning' },
    ]

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <AppManagementHeader
                app={{
                    id: app.id,
                    tenant_id: app.tenant_id,
                    name: app.name,
                    status: 'active',
                    url: app.url
                }}
                onUpdateIdentity={() => setShowUpdateModal(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <ApiKeyCard
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        apiKey={(app as any).api_key || ''}
                        showApiKey={showApiKey}
                        onCopy={handleCopyKey}
                        onRegenerate={async () => {
                            // Implementation for regeneration
                            console.log('Regenerate key')
                        }}
                    />
                </div>
                <div className="lg:col-span-2">
                    <AppStatsGrid stats={statsData} />
                </div>
            </div>

            {/* Scenario Broadcast Control */}
            <ScenarioBroadcastCard appId={appId} appName={app.name} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AppUsageCharts />
                <AppActivityLogs logs={recentLogs} />
            </div>

            <UpdateAppModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                formData={formData}
                setFormData={setFormData}
                onSave={handleUpdate}
                isSaving={isSaving}
            />

            {/* Alerts */}
            {error && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl shadow-lg border border-red-100 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                        <button onClick={() => setError(null)} className="ml-2 hover:bg-red-100 p-1 rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
            {success && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl shadow-lg border border-emerald-100 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <p className="text-sm font-medium">{success}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
