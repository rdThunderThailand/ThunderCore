'use client'

import { Profile } from '@/types/dashboard'
import { Save, Upload, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteUser, updateUser } from './actions'

interface SettingsClientProps {
    user: Profile
}

export function SettingsClient({ user }: SettingsClientProps) {
    const router = useRouter()
    // Normalize role string to match either 'Super Admin', 'Admin', or 'User'
    const getNormalizedRole = (r: string) => {
        if (r === 'super_admin' || r === 'Super Admin') return 'Super Admin'
        if (r === 'admin' || r === 'Admin') return 'Admin'
        return 'User'
    }

    const [firstName, setFirstName] = useState(user.first_name || '')
    const [lastName, setLastName] = useState(user.last_name || '')
    const [email, setEmail] = useState(user.email || '')
    const [role, setRole] = useState<string>(getNormalizedRole((user.role as string) || 'User'))
    const [mfaEnabled, _setMfaEnabled] = useState(false)
    const [isActive, _setIsActive] = useState(user.is_active)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Mock Tenants Data
    const [tenants, _setTenants] = useState([
        { id: 'tenant-1', name: 'Executive Demo Tenant', image: 'E', startedAt: '12 May 2026', memberCount: 5, createdOn: '12 May 2026' }
    ])
    const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([])

    const toggleSelectAllTenants = () => {
        if (selectedTenantIds.length === tenants.length) {
            setSelectedTenantIds([])
        } else {
            setSelectedTenantIds(tenants.map(t => t.id))
        }
    }

    const toggleSelectTenant = (id: string) => {
        if (selectedTenantIds.includes(id)) {
            setSelectedTenantIds(selectedTenantIds.filter(tId => tId !== id))
        } else {
            setSelectedTenantIds([...selectedTenantIds, id])
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            // ponytail: backend PATCH /users/:id only accepts first_name/last_name —
            // email, role, MFA, and active status have no update endpoint yet.
            const updated = await updateUser(user.id, { first_name: firstName, last_name: lastName })
            setFirstName(updated.first_name)
            setLastName(updated.last_name)
            toast.success('User settings saved successfully.')
        } catch (error) {
            const err = error as Error
            toast.error(err.message || 'Failed to save user settings.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteUser = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete user "${firstName} ${lastName}"? This action is irreversible.`)
        if (!confirmed) return

        try {
            await deleteUser(user.id)
            toast.success('User deleted successfully.')
            router.push('/users')
        } catch (error) {
            const err = error as Error
            toast.error(err.message || 'Failed to delete user.')
        }
    }

    return (
        <div className="min-h-screen pb-24">
            <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8 animate-in fade-in duration-500">

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Card 1: Authorized Provider */}
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-indigo-950">Authorized Provider</h2>
                                <p className="text-sm text-slate-400 mt-1">Update your Authorized Provider details and information.</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Azure
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Profile Image Upload section */}
                            <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-40 space-y-3">
                                <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer bg-slate-50/50">
                                    <Upload className="w-6 h-6 mb-1 text-slate-400" />
                                    <span className="text-xs font-semibold">Upload</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-700">Profile Image</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Recommended: 400x400px</p>
                                </div>
                            </div>

                            {/* Inputs section */}
                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="First Name"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Last Name"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Role</label>
                                    {/* ponytail: no PATCH endpoint for role yet — read-only until one exists */}
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        disabled
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                                    >
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Super Admin">Super Admin</option>
                                    </select>
                                </div>

                                <div className="space-y-1 md:col-span-2 max-w-sm">
                                    <label className="text-xs font-bold text-slate-500">MFA Enabled</label>
                                    <input
                                        type="text"
                                        value={mfaEnabled ? 'true' : 'false'}
                                        disabled
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 shrink-0 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Active Status */}
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-indigo-950">Active Status</h2>
                            <p className="text-sm text-slate-400 mt-1">Set user status: active or inactive.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                            </span>
                            {/* ponytail: no PATCH endpoint for status yet — toggle is read-only */}
                            <button
                                type="button"
                                disabled
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed opacity-60 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Email Notifications */}
                    <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-indigo-950">Email Notifications</h2>
                            <p className="text-sm text-slate-400 mt-1">Receive emails about new products, features, and more.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${emailNotifications ? 'text-blue-600' : 'text-slate-400'}`}>
                                {emailNotifications ? 'Enabled' : 'Disabled'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailNotifications ? 'bg-blue-600' : 'bg-slate-200'
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${emailNotifications ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Card 4: Tenants */}
                <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-indigo-950">Tenants</h2>
                        <p className="text-sm text-slate-400 mt-1">A list of tenants using this application.</p>
                    </div>

                    {/* Tenants Table */}
                    <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                                            checked={selectedTenantIds.length === tenants.length && tenants.length > 0}
                                            onChange={toggleSelectAllTenants}
                                        />
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide w-24">IMAGE</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide">NAME</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide">STARTED AT</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide">MEMBER COUNT</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-900 uppercase tracking-wide">CREATED ON</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {tenants.map((tenant) => {
                                    const isSelected = selectedTenantIds.includes(tenant.id)
                                    return (
                                        <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectTenant(tenant.id)}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold border border-blue-200">
                                                    {tenant.image}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-semibold text-slate-700">
                                                {tenant.name}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-400 font-medium">
                                                {tenant.startedAt}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-500 font-semibold">
                                                {tenant.memberCount}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-400 font-medium">
                                                {tenant.createdOn}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Tenants Table Footer */}
                    <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                        <div className="text-sm text-slate-400 font-medium">
                            Page 1 of 1
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 transition-all cursor-not-allowed opacity-50 bg-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 font-bold text-sm transition-all"
                            >
                                1
                            </button>
                            <button
                                disabled
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 transition-all cursor-not-allowed opacity-50 bg-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card 5: Delete User */}
                <div className="bg-red-50 border border-red-100 rounded-[20px] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex gap-4 items-start w-full">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-red-950">Delete User</h2>
                            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                                Account removal requires an inactive billing status. Please ensure all subscriptions are cancelled or expired before proceeding.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDeleteUser}
                        className="px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20 shrink-0 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete User</span>
                    </button>
                </div>

            </div>
        </div>
    )
}
