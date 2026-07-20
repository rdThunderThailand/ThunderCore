'use client'

import {
    AlertCircle,
    Check,
    ChevronDown, // Using FileBox as Application/Project icon
    Database, FileBox, LayoutGrid, Loader2, Plus, Save, Trash2, X
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Application } from '@/types/applications'
import { MemberDetails } from '@/types/members'
import {
    assignApplicationToMember, getMemberApplications, getMemberDetails, getTenantApplications, removeApplicationFromMember, updateMemberProfile
} from '../../actions'

export function TenantsManagementidMembersmemberIdSettingsClient() {
    const params = useParams()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter()
    const tenantId = params.id as string
    const memberId = params.memberId as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [member, setMember] = useState<MemberDetails | null>(null)
    const [applications, setApplications] = useState<Application[]>([])

    // Add Application Modal State
    const [showAddAppModal, setShowAddAppModal] = useState(false)
    const [orgApps, setOrgApps] = useState<Application[]>([])
    const [selectedAppId, setSelectedAppId] = useState('')
    const [isAddingApp, setIsAddingApp] = useState(false)
    const [appToDelete, setAppToDelete] = useState<string | null>(null)

    // Form State
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    async function loadData() {
        try {
            setIsLoading(true)
            const [memberData, appsData, orgAppsData] = await Promise.all([
                getMemberDetails(memberId, tenantId),
                getMemberApplications(tenantId, memberId),
                getTenantApplications(tenantId)
            ])

            setMember(memberData)
            setApplications(appsData)
            setOrgApps(orgAppsData)

            // Init form
            setFirstName(memberData.profiles.first_name)
            setLastName(memberData.profiles.last_name)
            setEmail(memberData.profiles.email)

        } catch (err) {
            console.error('Error loading member settings:', err)
            setErrorMsg('Failed to load member data')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId, tenantId])

    const handleSaveProfile = async () => {
        if (!member?.user_id) return

        try {
            setIsSaving(true)
            setErrorMsg(null)
            setSuccessMsg(null)

            await updateMemberProfile(member.user_id, {
                first_name: firstName,
                last_name: lastName
            })

            setSuccessMsg('Profile updated successfully')
            setTimeout(() => setSuccessMsg(null), 3000)
        } catch (err) {
            console.error('Error updating profile:', err)
            setErrorMsg('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddApplication = async () => {
        if (!selectedAppId) {
            setErrorMsg('Please select an application')
            return
        }

        try {
            setIsAddingApp(true)
            setErrorMsg(null)

            const newApp = await assignApplicationToMember(tenantId, memberId, selectedAppId)
            setApplications((prev) => [...prev, newApp])

            setShowAddAppModal(false)
            setSelectedAppId('')
            setSuccessMsg('Application assigned successfully')
            setTimeout(() => setSuccessMsg(null), 3000)

        } catch (err) {
            console.error('Error adding application:', err)
            setErrorMsg('Failed to assign application')
        } finally {
            setIsAddingApp(false)
        }
    }

    const handleRemoveApplication = (appId: string) => {
        setAppToDelete(appId)
    }

    const confirmDeleteApplication = async () => {
        if (!appToDelete) return

        try {
            setErrorMsg(null)
            await removeApplicationFromMember(tenantId, memberId, appToDelete)

            setApplications((prev) => prev.filter((app) => app.id !== appToDelete))
            setSuccessMsg('Application removed successfully')
            setTimeout(() => setSuccessMsg(null), 3000)
            setAppToDelete(null)
        } catch (err) {
            console.error('Error removing application:', err)
            setErrorMsg('Failed to remove application')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 bg-[#F8F9FC] min-h-screen font-sans text-slate-900">
            {/* Note: Header is handled in Navbar based on route */}

            {/* Profile Settings Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Profile Settings</h2>
                    <p className="text-slate-500 mt-1">Update your profile details and information.</p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12">
                    {/* Avatar Column */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-40 h-40 rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-500 transition-all cursor-pointer group">
                            <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold">Upload</span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-900">Profile Image</p>
                            <p className="text-xs text-slate-400 mt-1">Recommended: 400x400px</p>
                        </div>
                    </div>

                    {/* Form Column */}
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                readOnly // Read-only as per typical requirements unless we add email change flow
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 outline-none cursor-not-allowed text-sm font-medium"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-[#0F53FF] text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-sm shadow-blue-200 flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Applications</h2>
                        <p className="text-slate-500 mt-1">View user applications</p>
                    </div>
                    <button
                        onClick={() => setShowAddAppModal(true)}
                        className="px-4 py-2 bg-[#0F53FF] text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-sm shadow-blue-200 flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Application
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 w-10">
                                    <input type="checkbox" className="rounded border-slate-300" />
                                </th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">Application</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-right">Created On</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <Database className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-medium">No Data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <input type="checkbox" className="rounded border-slate-300" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                    <FileBox className="w-4 h-4" />
                                                </div>
                                                <Link
                                                    href={`/dashboard/application/management/${app.id}/settings`}
                                                    className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors block"
                                                >
                                                    {app.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm text-slate-500">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveApplication(app.id)}
                                                className="text-blue-600 hover:text-blue-700 font-bold text-sm hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-50 flex items-center justify-between text-sm text-slate-500">
                        <span>Page 1 of 5</span>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 disabled:opacity-50">&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 font-bold border border-blue-100">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">3</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">4</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">5</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50">&gt;</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Application Modal */}
            {showAddAppModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">Add User&apos;s Application</h3>
                            </div>
                            <button onClick={() => setShowAddAppModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Application</label>
                                <div className="relative">
                                    <select
                                        value={selectedAppId}
                                        onChange={(e) => setSelectedAppId(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg appearance-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    >
                                        <option value="">Select an application...</option>
                                        {orgApps.map(app => (
                                            <option key={app.id} value={app.id}>{app.name}</option>
                                        ))}
                                    </select>
                                    <FileBox className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50/50 flex gap-3 border-t border-slate-50 justify-end">
                            <button
                                onClick={() => setShowAddAppModal(false)}
                                className="px-6 h-10 rounded-lg border border-blue-200 bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors text-sm flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleAddApplication}
                                disabled={isAddingApp || !selectedAppId}
                                className="px-6 h-10 rounded-lg bg-[#0F53FF] text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
                            >
                                {isAddingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {appToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
                        <div className="p-6 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">Are you absolutely sure?</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    This action cannot be undone. It will permanently remove access to this application for the user.
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-50/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-50">
                            <button
                                onClick={() => setAppToDelete(null)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteApplication}
                                className="px-4 py-2 bg-[#ff4f4f] text-white font-bold rounded-lg hover:bg-red-600 transition-colors text-sm shadow-sm shadow-red-200 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Toast */}
            {(successMsg || errorMsg) && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${successMsg
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                        {successMsg ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{successMsg || errorMsg}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
