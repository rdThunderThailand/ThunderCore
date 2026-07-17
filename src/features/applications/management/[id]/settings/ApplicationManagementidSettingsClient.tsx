'use client'

import { ApplicationDetails } from '@/models/Application'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getTenants } from '../../../../platform-tenants/actions'
import {
    addApplicationAuthorization, getApplicationById, getApplicationTenants, removeApplicationAuthorization, updateApplication
} from '../actions'
import { AddOrgModal } from './components/AddOrgModal'
import { ApiKeySection } from './components/ApiKeySection'
import { DeleteOrgConfirmModal } from './components/DeleteOrgConfirmModal'
import { OrgAccessTable } from './components/OrgAccessTable'
import { SettingsForm } from './components/SettingsForm'

export function ApplicationManagementidSettingsClient() {
    const params = useParams()
    const router = useRouter()
    const appId = params.id as string

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [app, setApp] = useState<ApplicationDetails | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tenants, setTenants] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Add Org State
    const [isAddOrgOpen, setIsAddOrgOpen] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [availableOrgs, setAvailableOrgs] = useState<any[]>([])
    const [selectedOrg, setSelectedOrg] = useState('')
    const [isAddingOrg, setIsAddingOrg] = useState(false)

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orgToDelete, setOrgToDelete] = useState<any>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Date Range State
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        url: '',
        logo_url: '' as string | null
    })

    useEffect(() => {
        loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const [appData, orgsData] = await Promise.all([
                getApplicationById(appId),
                getApplicationTenants(appId)
            ])

            if (!appData) {
                router.push('/dashboard/application')
                return
            }

            setApp(appData)
            setTenants(orgsData || [])
            setFormData({
                name: appData.name,
                url: appData.url || '',
                logo_url: appData.logo_url || null
            })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('Failed to load application data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddOrgClick = async () => {
        try {
            setIsAddingOrg(true)
            // Fetch all orgs
            const allOrgs = await getTenants()

            // Filter out existing ones
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingIds = new Set(tenants.map((o: any) => o.id))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const available = allOrgs.filter((o: any) => !existingIds.has(o.id))

            setAvailableOrgs(available)
            setIsAddOrgOpen(true)
            if (available.length > 0) setSelectedOrg(available[0].id)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('Failed to load tenants for selection')
        } finally {
            setIsAddingOrg(false)
        }
    }

    const handleSubmitAddOrg = async () => {
        if (!selectedOrg) return

        try {
            setIsAddingOrg(true)
            await addApplicationAuthorization(
                appId, 
                selectedOrg, 
                startDate ? startDate.toISOString() : undefined, 
                endDate ? endDate.toISOString() : undefined
            )
            setSuccess('Tenant added successfully!')
            setIsAddOrgOpen(false)
            // Reload list
            const orgs = await getApplicationTenants(appId)
            setTenants(orgs || [])
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsAddingOrg(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDeleteClick = (org: any) => {
        setOrgToDelete(org)
        setDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!orgToDelete) return

        try {
            setIsDeleting(true)
            await removeApplicationAuthorization(appId, orgToDelete.id)
            setSuccess('Tenant access removed successfully!')
            setDeleteModalOpen(false)
            // Reload list
            const orgs = await getApplicationTenants(appId)
            setTenants(orgs || [])
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsDeleting(false)
            setOrgToDelete(null)
        }
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Application name is required')
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            await updateApplication(appId, {
                name: formData.name,
                url: formData.url,
                logo_url: formData.logo_url
            })
            setSuccess('Settings saved successfully!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
            <SettingsForm
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                isSaving={isSaving}
            />

            <ApiKeySection appId={appId} />

            <OrgAccessTable
                tenants={tenants}
                onAddClick={handleAddOrgClick}
                onDeleteClick={handleDeleteClick}
            />

            <AddOrgModal
                isOpen={isAddOrgOpen}
                onClose={() => setIsAddOrgOpen(false)}
                availableOrgs={availableOrgs}
                selectedOrg={selectedOrg}
                setSelectedOrg={setSelectedOrg}
                onSave={handleSubmitAddOrg}
                isSaving={isAddingOrg}
                onDateChange={(start, end) => {
                    setStartDate(start)
                    setEndDate(end)
                }}
            />

            <DeleteOrgConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
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
