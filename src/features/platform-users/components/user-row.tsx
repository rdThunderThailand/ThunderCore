'use client'

import { useToast } from '@/components/toast'
import { useTranslation } from '@/i18n/context'
import { Profile, UserRowProps } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteUser, setUserRole } from '../actions'
import { DeleteConfirmModal } from './delete-confirm-modal'

const roleBadgeStyles: Record<string, string> = {
    super_admin: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    company_admin: 'bg-blue-50 text-blue-700 border-blue-200',
    operator: 'bg-slate-100 text-slate-600 border-slate-200',
    user: 'bg-slate-100 text-slate-600 border-slate-200',
}

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    company_admin: 'Admin',
    operator: 'User',
    user: 'User',
}

const ROLE_OPTIONS = [
    { value: 'super_admin',   label: 'Super Admin' },
    { value: 'company_admin', label: 'Admin' },
    { value: 'operator',      label: 'User' },
]

 
export function UserRow({ profile, isSelf, onProfileUpdate, onDelete }: UserRowProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isChangingRole, setIsChangingRole] = useState(false)
    const [currentRole, setCurrentRole] = useState<string>(profile.role || 'operator')
    const { t } = useTranslation()
    const router = useRouter()
    const { showToast } = useToast()

    // Display name: use first+last from profile, else email, else 'Anonymous User'
    const displayName = (profile.first_name || profile.last_name)
        ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
        : (profile.email || 'Anonymous User')

    const handleRoleChange = async (newRole: string) => {
        if (newRole === currentRole || isSelf) return
        setIsChangingRole(true)
        try {
            await setUserRole(profile.id, newRole)
            setCurrentRole(newRole)
            onProfileUpdate(profile.id, { role: newRole as Profile['role'] })
            showToast(`เปลี่ยน role เป็น ${roleLabels[newRole] || newRole} สำเร็จ`, 'success')
        } catch (err) {
            showToast('เปลี่ยน role ไม่สำเร็จ: ' + (err as Error).message, 'error')
        } finally {
            setIsChangingRole(false)
        }
    }

    const isJoined = profile.is_active
    const roleStyle = roleBadgeStyles[currentRole] || roleBadgeStyles.operator
    const roleLabel = roleLabels[currentRole] || currentRole

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteUser(profile.id)
            onDelete(profile.id)
            showToast(t('modal.successDeleted'))
        } catch (err) {
            alert('Error deleting user: ' + (err as Error).message)
            setIsDeleting(false)
            setShowDeleteModal(false)
        }
    }

    return (
        <>
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                userName={displayName}
            />

            <tr
                onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest('button') || target.closest('input')) return
                    router.push(`/settings?user=${profile.id}`)
                }}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
                {/* Checkbox */}
                <td className="p-4 w-10" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300" />
                </td>

                {/* Avatar */}
                <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 font-bold text-sm border border-violet-200">
                        {profile.first_name?.charAt(0) || profile.email?.charAt(0).toUpperCase()}
                    </div>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{displayName}</span>
                </td>

                {/* Role Badge — dropdown if not self */}
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {isSelf ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${roleStyle}`}>
                            {roleLabel}
                        </span>
                    ) : (
                        <div className="relative inline-block">
                            <select
                                value={currentRole}
                                disabled={isChangingRole}
                                onChange={e => handleRoleChange(e.target.value)}
                                className={`text-xs font-semibold pl-2.5 pr-6 py-1 rounded-md border appearance-none cursor-pointer
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all
                                    disabled:opacity-50 disabled:cursor-wait
                                    ${roleStyle}`}
                            >
                                {ROLE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {isChangingRole && (
                                <span className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                    )}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                    {isJoined ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                            {t('users.joined')}
                        </span>
                    ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md border bg-slate-100 text-slate-500 border-slate-200">
                            {t('users.notJoined')}
                        </span>
                    )}
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-right">
                    <button
                        disabled={isSelf}
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteModal(true)
                        }}
                        className={`text-sm font-medium transition-colors ${isSelf
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-800 hover:underline'
                            }`}
                    >
                        {t('common.delete')}
                    </button>
                </td>
            </tr>
        </>
    )
}
