'use client'

import { useTranslation } from '@/i18n/context'
import { isPendingInvite, Membership } from '@/types/members'
import { TenantRoleDefinition } from '@/types/roles'
import {
    AlertCircle, Crown, Loader2, Plus, Search, Shield, Users, X
} from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getTenantRoles } from './actions'
import { DeleteConfirmModal } from './components/delete-confirm-modal'
import { InviteModal } from './components/invite-modal'
import { useMemberStore } from '@/store/useMemberStore'

const ROLE_MAP: Record<string, string> = {
    'owner': 'Owner',
    'admin': 'Admin',
    'super_admin': 'Super Admin',
    'department_admin': 'Department Admin',
    'company_admin': 'Company Admin',
    'admin_company': 'Company Admin',
    'operator': 'Operator',
    'viewer_auditor': 'Auditor',
    'auditor': 'Auditor',
}
//ใส่ดักไว้ก่อนให้มันผ่าน เดียวมาแก้ เดียวแก้ตาม role ใน database

export function TenantsManagementidMembersClient() {
    const params = useParams()
    const pathname = usePathname()
    const tenantId = params.code as string
    const { t } = useTranslation()

    const {
        members, totalCount, isLoading, searchTerm, setSearchTerm,
        currentPage, setCurrentPage, itemsPerPage,
        fetchMembers, inviteMember, removeMember, changeRole
    } = useMemberStore()

    const [showInviteModal, setShowInviteModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    // Set when addMembership() falls back to a pending invitation (brand-new email) — the
    // backend never sends the invite email itself, so this link is the only way to deliver it.
    const [pendingInviteUrl, setPendingInviteUrl] = useState<string | null>(null)
    const [roles, setRoles] = useState<TenantRoleDefinition[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchMembers(tenantId)
        }, 300)
        return () => clearTimeout(timeout)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId, currentPage, searchTerm])

    useEffect(() => {
        getTenantRoles(tenantId)
            .then(setRoles)
            .catch((err) => console.error('Failed to load tenant roles:', err))
    }, [tenantId])

    console.log('ไก่กา', members)

    const handleInviteSubmit = async (email: string, roleCode: string) => {
        setIsSubmitting(true)
        setError(null)

        try {
            const result = await inviteMember(tenantId, email, roleCode)
            if (isPendingInvite(result)) {
                // Keep the modal open so the invite link can be handed to the invitee — closing
                // it here would throw the only copy of the link away.
                setPendingInviteUrl(result.invite_url)
            } else {
                setShowInviteModal(false)
                setSuccess('Member added successfully!')
                setTimeout(() => setSuccess(null), 3000)
            }
        } catch (err) {
            const error = err as Error
            setError(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemove = async (memberId: string) => {
        setIsSubmitting(true)
        setError(null)

        try {
            await removeMember(tenantId, memberId)
            setDeleteConfirm(null)
            setSuccess('Member removed successfully')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            const error = err as Error
            setError(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleRoleChange = async (memberId: string, newRoleCode: string) => {
        try {
            await changeRole(tenantId, memberId, newRoleCode)
            setActiveDropdown(null)
            setSuccess('Role updated successfully')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            const error = err as Error
            setError(error.message)
        }
    }
    const filteredMembers = members
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))

    const getMemberRole = (member: Membership) => {
        const rawRole = (
            member.role ||
            (member as any).role_code ||
            (member as any).role_type ||
            (member as any).role_name ||
            ''
        ).toLowerCase().trim() || ''

        return ROLE_MAP[rawRole] || (rawRole ? rawRole : 'Member')
    }

    return (
        <div className="p-8 space-y-8 min-h-screen font-sans text-slate-900">
            {/* Header / Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full md:max-w-xl flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('members.searchByMembers')}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <button className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">
                        {t('common.search')}
                    </button>
                </div>
                <button
                    onClick={() => {
                        setPendingInviteUrl(null)
                        setShowInviteModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0F53FF] text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 text-sm whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    {t('modal.inviteUser')}
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl shadow-lg border border-red-100 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                        <button onClick={() => setError(null)} className="ml-2 hover:bg-red-100 p-1 rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
            {success && (
                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl shadow-lg border border-emerald-100 flex items-center gap-3">
                        <Shield className="w-5 h-5" />
                        <p className="text-sm font-medium">{success}</p>
                    </div>
                </div>
            )}

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 w-10">
                                    <input type="checkbox" className="rounded border-slate-300" />
                                </th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">{t('table.image')}</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">{t('table.name')}</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">{t('table.email')}</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-center">{t('table.role')}</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide">{t('table.invitedAt')}</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-center">{t('table.status')}</th>
                                <th className="px-4 py-3 text-xs font-bold text-slate-800 uppercase tracking-wide text-right">{t('table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-3">
                                                <Users className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-medium">{t('members.noMembers')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <input type="checkbox" className="rounded border-slate-300" />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold border border-pink-200">
                                                {member.user?.full_name?.charAt(0) || member.user?.email?.charAt(0) || '?'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`${pathname}/${member.id}/settings`}
                                                className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
                                            >
                                                {member.user?.full_name || 'Unknown'}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-slate-600">{member.user?.email || 'No email'}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-medium text-slate-700">
                                                {getMemberRole(member)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-slate-500">
                                                {new Date(member.joined_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                                                Joined
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {member.role !== 'owner' && (
                                                <button
                                                    onClick={() => setDeleteConfirm(member.id)}
                                                    className="text-blue-600 text-sm hover:underline font-medium hover:text-blue-700 transition-colors"
                                                >
                                                    {t('common.delete')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-50 flex items-center justify-between text-sm text-slate-500">
                        <span>{t('common.page')} {currentPage} {t('common.of')} {totalPages}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 disabled:opacity-50"
                            >
                                &lt;
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 font-bold border border-blue-100">
                                {currentPage}
                            </div>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage >= totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <InviteModal
                    onSubmit={handleInviteSubmit}
                    onClose={() => {
                        setShowInviteModal(false)
                        setPendingInviteUrl(null)
                    }}
                    isSubmitting={isSubmitting}
                    inviteUrl={pendingInviteUrl}
                    roles={roles}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <DeleteConfirmModal
                    onConfirm={() => handleRemove(deleteConfirm)}
                    onClose={() => setDeleteConfirm(null)}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
