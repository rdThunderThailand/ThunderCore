'use client'

import { useApplicationStore } from '@/store/useApplicationStore'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { InviteMemberModal } from './components/InviteMemberModal'
import { MembersListHeader } from './components/MembersListHeader'
import { MembersTable } from './components/MembersTable'

export function ApplicationManagementidMembersClient({
    appId,
    tenantId,
    basePath = '/applications',
}: {
    appId: string
    tenantId: string
    basePath?: string
}) {
    const router = useRouter()
    const {
        currentApp, applicationMembers, isAppLoading, isMembersLoading,
        fetchApplicationById, fetchApplicationMembers, revokeAccess, inviteAppMember,
    } = useApplicationStore()
    const isLoading = isAppLoading || isMembersLoading
    const [searchTerm, setSearchTerm] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [app] = await Promise.all([
                    fetchApplicationById(appId),
                    fetchApplicationMembers(appId),
                ])
                if (!app) {
                    router.push(basePath)
                }
            } catch {
                toast.error('Failed to load members')
            }
        }
        load()
    }, [appId, router, basePath, fetchApplicationById, fetchApplicationMembers])

    const appName = currentApp?.name ?? ''

    const handleInvite = async (memberId: string, role: 'Admin' | 'Developer' | 'Viewer') => {
        setIsInviting(true)
        try {
            await inviteAppMember(tenantId, appId, memberId, role)
            setShowInviteModal(false)
            toast.success('Member invited')
        } catch {
            toast.error('Failed to invite member')
        } finally {
            setIsInviting(false)
        }
    }

    const handleRemove = async (accessId: string, membershipId: string) => {
        setActiveDropdown(null)
        try {
            await revokeAccess(tenantId, appId, accessId, membershipId)
            toast.success('Member removed')
        } catch {
            toast.error('Failed to remove member')
        }
    }

    const filteredMembers = useMemo(() => {
        const q = searchTerm.toLowerCase()
        return applicationMembers.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    }, [applicationMembers, searchTerm])

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden p-8 gap-6 animate-in fade-in duration-500">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col min-h-0 flex-1">
                <MembersListHeader appName={appName} onInviteClick={() => setShowInviteModal(true)} />

                <MembersTable
                    members={filteredMembers}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    onRemoveMember={handleRemove}
                />
            </section>

            {showInviteModal && (
                <InviteMemberModal
                    tenantId={tenantId}
                    existingMemberIds={applicationMembers.map((m) => m.membershipId)}
                    isSubmitting={isInviting}
                    onClose={() => setShowInviteModal(false)}
                    onInvite={handleInvite}
                />
            )}
        </div>
    )
}
