'use client'

import { Plus, X } from 'lucide-react'

interface InviteMemberModalProps {
    isOpen: boolean
    onClose: () => void
    inviteForm: {
        email: string
        role: string
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setInviteForm: (form: any) => void
    onInvite: () => Promise<void>
}

export function InviteMemberModal({
    isOpen,
    onClose,
    inviteForm,
    setInviteForm,
    onInvite
}: InviteMemberModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Invite Member</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="colleague@company.com"
                            className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 focus:bg-white outline-none transition-all font-bold"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                        <select
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                            className="w-full px-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-violet-500 outline-none transition-all font-bold"
                        >
                            <option value="Viewer">Viewer</option>
                            <option value="Developer">Developer</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button
                        onClick={onInvite}
                        className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Send Invitation
                    </button>
                </div>
            </div>
        </div>
    )
}
