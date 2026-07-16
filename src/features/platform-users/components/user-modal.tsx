'use client'

import { AlertCircle, Loader2, Save, X } from 'lucide-react'
import { useState } from 'react'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: {
        email: string
        role: string
    }) => Promise<void>
    isLoading: boolean
    error: string | null
}

export function UserModal({ isOpen, onClose, onSave, isLoading, error }: UserModalProps) {
    const [formData, setFormData] = useState({
        email: '',
        role: 'operator'
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Invite New User</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="user@example.com"
                            className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 focus:bg-white outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>



                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Assign Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all"
                            disabled={isLoading}
                        >
                            <option value="operator">Operator</option>
                            <option value="company_admin">Admin Company</option>
                        </select>
                    </div>

                    <button
                        onClick={() => onSave(formData)}
                        disabled={isLoading}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Create User Account</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
