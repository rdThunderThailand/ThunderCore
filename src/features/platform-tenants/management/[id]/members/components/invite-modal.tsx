import { useTranslation } from '@/i18n/context';
import { TenantRoleDefinition } from '@/types/roles';
import { Check, Copy, Loader2, MailCheck, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

export type SentInvite = { url: string; email: string; isEmailSent: boolean; hasAccount: boolean };

export function InviteModal({ onSubmit, onClose, isSubmitting, sentInvite, roles }: {
    onSubmit: (email: string, roleCode: string) => void;
    onClose: () => void;
    isSubmitting: boolean;
    // Set once the backend responds with a pending invitation (brand-new email, no account
    // yet) instead of a membership. The link is always shown: it's the only delivery channel
    // when the backend didn't email it, and a fallback when the email doesn't arrive.
    sentInvite?: SentInvite | null;
    // The tenant's real assignable roles (GET /tenants/:id/roles) — sent as-is, not translated
    // through a fixed label map. A tenant can have several roles sharing one role_type (e.g.
    // multiple operator personas), so there is no generic code to guess from a label.
    roles: TenantRoleDefinition[];
}) {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    // Derived rather than synced via effect: no selection yet just means "use the first
    // loaded role" until the user actually picks one.
    const [selectedRoleCode, setSelectedRoleCode] = useState('')
    const roleCode = selectedRoleCode || roles[0]?.code || ''
    const [copied, setCopied] = useState(false)

    const handleSubmit = () => {
        onSubmit(email, roleCode)
    }

    const handleCopy = async () => {
        if (!sentInvite) return
        try {
            await navigator.clipboard.writeText(sentInvite.url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard API blocked (permissions/insecure context) — the input is still
            // readonly + selectable so the user can copy it manually.
        }
    }

    if (sentInvite) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-100">
                    <div className="px-6 py-5 flex justify-between items-center border-b border-slate-50">
                        <h3 className="font-bold text-lg text-slate-900">
                            {sentInvite.isEmailSent ? 'Invitation sent' : 'Invitation created'}
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-3">
                        {sentInvite.isEmailSent ? (
                            <>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">
                                    <MailCheck className="w-5 h-5 shrink-0" />
                                    <p>
                                        An invitation email was sent to <span className="font-bold">{sentInvite.email}</span>.
                                        {sentInvite.hasAccount
                                            ? ' They\'re on the roster as invited until they accept it.'
                                            : ' They\'ll join the roster once they accept it.'}
                                    </p>
                                </div>
                                <p className="text-sm text-slate-600">
                                    If the email doesn&apos;t arrive, you can share this link with them directly:
                                </p>
                            </>
                        ) : sentInvite.hasAccount ? (
                            <p className="text-sm text-slate-600">
                                They were added to the roster as invited, but the invitation email couldn&apos;t be
                                sent. Send them this link so they can accept the invite:
                            </p>
                        ) : (
                            <p className="text-sm text-slate-600">
                                This email doesn&apos;t have a Thunder Core account yet, so it wasn&apos;t added to the
                                roster. Send them this link so they can accept the invite:
                            </p>
                        )}
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={sentInvite.url}
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
                    <h3 className="font-bold text-lg text-slate-900">{t('modal.inviteMember')}</h3>
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

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{t('table.role')}</label>
                        <select
                            value={roleCode}
                            onChange={(e) => setSelectedRoleCode(e.target.value)}
                            disabled={roles.length === 0}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm disabled:opacity-50"
                        >
                            {roles.length === 0 ? (
                                <option value="">Loading roles…</option>
                            ) : (
                                roles.map((r) => (
                                    <option key={r.id} value={r.code}>{r.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="px-6 py-5 bg-slate-50/50 flex gap-3 border-t border-slate-50">
                    <button
                        onClick={onClose}
                        className="flex-1 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !email.trim() || !roleCode}
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
