import { useTranslation } from '@/i18n/context';
import { TenantRole } from '@/types/members';
import { Loader2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

export function InviteModal({ onSubmit, onClose, isSubmitting }: {
    onSubmit: (email: string, role: TenantRole) => void;
    onClose: () => void;
    isSubmitting: boolean;
}) {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<TenantRole>('Executive Viewer')

    const handleSubmit = () => {
        onSubmit(email, role)
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
                            value={role}
                            onChange={(e) => setRole(e.target.value as TenantRole)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm"
                        >
                            <option value="Executive Viewer">Executive Viewer</option>
                            <option value="Department Admin">Department Admin</option>
                            <option value="Operator">Operator</option>
                            <option value="Auditor">Auditor</option>
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
