'use client'

import { useTranslation } from '@/i18n/context'
import { Check, Copy, Loader2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { ROLE_OPTIONS, RoleValue } from './role-cell'

export function InviteUserModal({ onSubmit, onClose, isSubmitting, inviteLink }: {
    onSubmit: (input: { email: string; first_name?: string; last_name?: string; role: RoleValue }) => void
    onClose: () => void
    isSubmitting: boolean
    // Set once the backend responds — there's no email delivery for platform users right now
    // (the Send Email hook isn't wired up in the Supabase dashboard yet), so this link is the
    // only way the inviter can actually hand it to the invitee. Mirrors the tenant-members
    // invite-modal's same pattern (src/features/platform-tenants/.../invite-modal.tsx).
    inviteLink?: string | null
}) {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [role, setRole] = useState<RoleValue>('guest')
    const [copied, setCopied] = useState(false)

    const handleSubmit = () => {
        onSubmit({
            email,
            first_name: firstName.trim() || undefined,
            last_name: lastName.trim() || undefined,
            role,
        })
    }

    const handleCopy = async () => {
        if (!inviteLink) return
        try {
            await navigator.clipboard.writeText(inviteLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard API blocked (permissions/insecure context) — the input is still
            // readonly + selectable so the user can copy it manually.
        }
    }

    if (inviteLink) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-100">
                    <div className="px-6 py-5 flex justify-between items-center border-b border-slate-50">
                        <h3 className="font-bold text-lg text-slate-900">Invitation created</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-3">
                        <p className="text-sm text-slate-600">
                            Email delivery isn&apos;t set up yet, so send this link to the invitee yourself
                            (Slack, LINE, etc.) — it lets them set a password and sign in:
                        </p>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={inviteLink}
                                onFocus={(e) => e.currentTarget.select()}
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 truncate"
                            />
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2.5 rounded-lg bg-[#0F53FF] text-white text-sm font-bold hover:bg-blue-600 transition-colors whitespace-nowrap flex items-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-5 bg-slate-50/50 flex gap-3 border-t border-slate-50">
                        <button
                            onClick={onClose}
                            className="flex-1 h-10 rounded-lg bg-[#0F53FF] text-white font-bold hover:bg-blue-600 transition-colors text-sm shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="px-6 py-5 flex justify-between items-center border-b border-slate-50">
                    <h3 className="font-bold text-lg text-slate-900">{t('modal.inviteUser')}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{t('modal.emailAddress')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">First name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Last name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{t('table.role')}</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as RoleValue)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm"
                        >
                            {ROLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="px-6 py-5 bg-slate-50/50 flex gap-3 border-t border-slate-50">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
                    >
                        {t('modal.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !email.trim()}
                        className="flex-1 h-10 rounded-lg bg-[#0F53FF] text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        {t('modal.sendInvite')}
                    </button>
                </div>
            </div>
        </div>
    )
}
