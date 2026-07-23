'use client'

import { useTranslation } from '@/i18n/context'
import { useApplicationStore } from '@/store/useApplicationStore'
import { Application } from '@/types/applications'
import {
    AlertCircle, AppWindow, Code, ExternalLink, Globe, Loader2, MoreVertical, Plus,
    Search, Server, Settings, Trash2, Users, X
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function TenantsManagementidApplicationsClient({ basePath }: { basePath?: string } = {}) {
    const params = useParams()
    const router = useRouter()
    const tenantId = params.id as string
    const base = basePath ?? '/applications/management'
    const { t } = useTranslation()

    const {
        applications, isLoading, searchTerm, setSearchTerm,
        memberAccess, isAccessLoading,
        fetchApplications, createApp, updateApp, deleteApp,
        fetchMemberAccess, grantAccess, revokeAccess, getLaunchUrl
    } = useApplicationStore()

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingApp, setEditingApp] = useState<Application | null>(null)
    const [accessApp, setAccessApp] = useState<Application | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<Application | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showApiKey, setShowApiKey] = useState<{ id: string; name: string } | null>(null)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    // Form States
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        environment: 'production' as 'production' | 'staging' | 'development',
        url: ''
    })

    useEffect(() => {
        fetchApplications(tenantId)
    }, [tenantId, fetchApplications])

    useEffect(() => {
        if (accessApp) {
            fetchMemberAccess(tenantId, accessApp.id)
        }
    }, [accessApp, tenantId, fetchMemberAccess])

    const resetForm = () => {
        setFormData({ name: '', description: '', environment: 'production', url: '' })
    }

    const handleCreateSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Application name is required')
            return
        }
        setIsSubmitting(true)
        setError(null)
        try {
            await createApp({ ...formData, tenantId: tenantId })
            setShowCreateModal(false)
            resetForm()
            setSuccess(t('applications.createSuccess'))
            setTimeout(() => setSuccess(null), 3000)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Failed to create application')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateSubmit = async () => {
        if (!editingApp) return
        setIsSubmitting(true)
        setError(null)
        try {
            await updateApp(editingApp.id, formData)
            setEditingApp(null)
            resetForm()
            setSuccess(t('applications.updateSuccess'))
            setTimeout(() => setSuccess(null), 3000)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Failed to update application')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return
        setIsSubmitting(true)
        setError(null)
        try {
            await deleteApp(deleteConfirm.id, tenantId)
            setDeleteConfirm(null)
            setSuccess(t('applications.deleteSuccess'))
            setTimeout(() => setSuccess(null), 3000)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Failed to delete application')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLaunch = async (app: Application) => {
        try {
            const launch_url = await getLaunchUrl(tenantId, app.id)
            window.open(launch_url, '_blank')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Failed to launch application')
        }
    }

    const handleStatusToggle = async (app: Application) => {
        try {
            const newStatus = app.status === 'active' ? 'inactive' : 'active'
            await updateApp(app.id, { status: newStatus })
            setSuccess(`Application ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
            setTimeout(() => setSuccess(null), 3000)
            setActiveDropdown(null)
        } catch (err) {
            const error = err as Error
            setError(error.message)
        }
    }

    const openAccessModal = async (app: Application) => {
        setAccessApp(app)
        setActiveDropdown(null)
        try {
            await fetchMemberAccess(tenantId, app.id)
        } catch (err) {
            console.error('Error loading member access:', err)
            setError('Failed to load member access')
        }
    }

    const handleToggleAccess = async (memberId: string, hasAccess: boolean) => {
        if (!accessApp) return

        try {
            if (hasAccess) {
                await revokeAccess(tenantId, accessApp.id, memberId)
            } else {
                await grantAccess(tenantId, accessApp.id, memberId)
            }
            setSuccess(hasAccess ? 'Access revoked' : 'Access granted')
            setTimeout(() => setSuccess(null), 2000)
        } catch (err) {
            const error = err as Error
            setError(error.message)
        }
    }

    const filteredApps = applications.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getEnvironmentIcon = (env: string) => {
        switch (env) {
            case 'production': return <Globe className="w-3 h-3" />
            case 'staging': return <Server className="w-3 h-3" />
            default: return <Code className="w-3 h-3" />
        }
    }

    const getEnvironmentColor = (env: string) => {
        switch (env) {
            case 'production': return 'bg-emerald-100 text-emerald-700'
            case 'staging': return 'bg-amber-100 text-amber-700'
            default: return 'bg-blue-100 text-blue-700'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500'
            case 'maintenance': return 'bg-amber-500'
            default: return 'bg-slate-400'
        }
    }

    return (
        <div className="mx-auto w-full px-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <p className="text-slate-500 font-medium text-sm">Manage applications deployed for this entity.</p>
                </div>

            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-4 text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p>{success}</p>
                </div>
            )}

            {/* Search */}
            <div className="relative w-full gap-50 flex justify-between">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-violet-50/50 outline-none transition-all font-bold"
                />

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center whitespace-nowrap gap-2 px-6 py-3.5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
                >
                    <Plus className="w-5 h-5" />
                    New Application
                </button>
            </div>

            {/* Apps Grid */}
            {isLoading ? (
                <div className="p-20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                </div>
            ) : filteredApps.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                        <AppWindow className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No Applications Found</h3>
                    <p className="text-slate-500 font-bold max-w-xs mt-2">
                        {searchTerm ? 'No applications match your search.' : 'Create your first application to get started.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApps.map((app) => (
                        <div
                            key={app.id}
                            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between gap-3 w-full">
                                <div className="flex items-start gap-4 min-w-0 w-full h-full">
                                    <div className="w-40 h-40 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                        {app.logo_url ? (
                                            <img src={app.logo_url} alt={app.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <AppWindow className="w-8 h-8 text-slate-400" />
                                        )}
                                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(app.status ?? 'inactive')} border-2 border-white`} />
                                    </div>
                                    <div className="min-w-0 h-40 w-full flex flex-col justify-between py-1">
                                        <h3 className="text-base font-black text-slate-900 truncate">{app.name}</h3>
                                        {app.description && (
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{app.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full flex items-center gap-1 ${getEnvironmentColor(app.environment || 'production')}`}>
                                                {getEnvironmentIcon(app.environment || 'production')}
                                                {app.environment}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => router.push(`${base}/${app.id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 text-xs font-black rounded-md hover:bg-slate-200 transition-all"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Edit Details
                                            </button>
                                            <button
                                                onClick={() => handleLaunch(app)}
                                                disabled={!app.url}
                                                title={app.url ? 'Open Application' : 'No URL configured'}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 text-white text-xs font-black rounded-md hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Open App
                                            </button>
                                        </div>
                                    </div>

                                </div>
                                {/* <div className="relative flex-shrink-0">
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === app.id ? null : app.id)}
                                        className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {activeDropdown === app.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-2">
                                                <button
                                                    onClick={() => openAccessModal(app)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    Manage Access
                                                </button>
                                                <button
                                                    onClick={() => handleStatusToggle(app)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                                                >
                                                    <AppWindow className="w-4 h-4" />
                                                    {app.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <div className="my-1 mx-2 border-t border-slate-100" />
                                                <button
                                                    onClick={() => {
                                                        setDeleteConfirm(app)
                                                        setActiveDropdown(null)
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div> */}
                            </div>



                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingApp) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingApp ? 'Edit Application' : 'New Application'}
                            </h2>
                            <button
                                onClick={() => { setShowCreateModal(false); setEditingApp(null); resetForm(); }}
                                className="p-2 hover:bg-slate-100 rounded-full"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Application Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="My Application"
                                    className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the application..."
                                    rows={3}
                                    className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 focus:bg-white outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Environment</label>
                                    <select
                                        value={formData.environment}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                                        className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all"
                                    >
                                        <option value="production">Production</option>
                                        <option value="staging">Staging</option>
                                        <option value="development">Development</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">URL</label>
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={editingApp ? handleUpdateSubmit : handleCreateSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                {isSubmitting ? 'Saving...' : (editingApp ? 'Save Changes' : 'Create Application')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Application</h2>
                        <p className="text-slate-600 mb-8">Are you sure you want to delete this application? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Access Modal */}
            {accessApp && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Manage Access</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Control who can access <span className="font-bold">{accessApp.name}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setAccessApp(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isAccessLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                            </div>
                        ) : memberAccess.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No members in this tenant</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {memberAccess.map(member => (
                                    <div
                                        key={member.user_id}
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {member.user?.full_name?.[0] || member.user?.email?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {member.user?.full_name || member.user?.email || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {member.role} {member.user?.email && `• ${member.user.email}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleAccess(member.user_id, member.has_access)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${member.has_access ? 'bg-violet-600' : 'bg-slate-200'
                                                }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${member.has_access ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-slate-200">
                            <button
                                onClick={() => setAccessApp(null)}
                                className="w-full px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
