'use client'

interface InviteForm {
    email: string
    role: string
}

interface InviteMemberModalProps {
    isOpen: boolean
    onClose: () => void
    inviteForm: InviteForm
    setInviteForm: (form: InviteForm) => void
    onInvite: () => void
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="mb-4 text-lg font-semibold">Invite member</h3>
                
                <div className="space-y-4">
                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Email Address</span>
                        <input
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="colleague@company.com"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </label>

                    <label className="text-sm">
                        <span className="mb-1 block text-slate-600">Role</span>
                        <select
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="Viewer">Viewer</option>
                            <option value="Developer">Developer</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={onInvite}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Send Invitation
                    </button>
                </div>
            </div>
        </div>
    )
}
