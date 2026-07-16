'use client'

import DateRangePicker from '@/components/dashboard/DateRangePicker'
import { ChevronLeft, LayoutGrid, Loader2, Plus, X } from 'lucide-react'

interface AddOrgModalProps {
    isOpen: boolean
    onClose: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    availableOrgs: any[]
    selectedOrg: string
    setSelectedOrg: (id: string) => void
    onSave: () => Promise<void>
    isSaving: boolean
    onDateChange: (start: Date | null, end: Date | null) => void
}

export function AddOrgModal({
    isOpen,
    onClose,
    availableOrgs,
    selectedOrg,
    setSelectedOrg,
    onSave,
    isSaving,
    onDateChange
}: AddOrgModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-100">
                {/* Modal Header */}
                <div className="px-6 py-5 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">Add Tenant&apos;s Application</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-2 space-y-6">
                    {/* Tenant Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tenant</label>
                        {availableOrgs.length > 0 ? (
                            <div className="relative">
                                <select
                                    className="w-full h-11 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none text-slate-700"
                                    value={selectedOrg}
                                    onChange={(e) => setSelectedOrg(e.target.value)}
                                >
                                    {availableOrgs.map(org => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronLeft className="w-4 h-4 rotate-270" />
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-sm">
                                No available tenants to add.
                            </div>
                        )}
                    </div>

                    {/* Date Range Picker */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
                        <DateRangePicker
                            onChange={onDateChange}
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-lg border border-blue-200 text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={availableOrgs.length === 0 || isSaving}
                        className="flex-1 h-11 rounded-lg bg-[#0F53FF] text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}
