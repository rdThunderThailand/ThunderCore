'use client'

import { AppMember } from '@/lib/applications'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getApplicationById, getApplicationMembers } from '../../actions'
import { InviteMemberModal } from './components/InviteMemberModal'
import { MembersListHeader } from './components/MembersListHeader'
import { MembersTable } from './components/MembersTable'

export function ApplicationManagementidMembersClient({ appId, basePath = '/applications' }: { appId: string; basePath?: string }) {
    const router = useRouter()

    const [appName, setAppName] = useState('')
    const [members, setMembers] = useState<AppMember[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'Viewer' })

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                const [app, membersData] = await Promise.all([
                    getApplicationById(appId),
                    getApplicationMembers(appId),
                ])
                if (!app) {
                    router.push(basePath)
                    return
                }
                setAppName(app.name)
                setMembers(membersData)
            } catch {
                toast.error('Failed to load members')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [appId, router, basePath])

    // ponytail: invite/remove are local-only until POST/DELETE members endpoints exist.
    const handleInvite = () => {
        if (!inviteForm.email.trim()) {
            toast.error('Email is required')
            return
        }
        const newMember: AppMember = {
            id: Date.now().toString(),
            name: inviteForm.email.split('@')[0],
            email: inviteForm.email,
            role: inviteForm.role as AppMember['role'],
            status: 'Pending',
        }
        setMembers((prev) => [...prev, newMember])
        setShowInviteModal(false)
        setInviteForm({ email: '', role: 'Viewer' })
        toast.success('Invitation sent!')
    }

    const handleRemove = (memberId: string) => {
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
        setActiveDropdown(null)
        toast.success('Member removed')
    }

    const filteredMembers = useMemo(() => {
        const q = searchTerm.toLowerCase()
        return members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    }, [members, searchTerm])

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

            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                inviteForm={inviteForm}
                setInviteForm={setInviteForm}
                onInvite={handleInvite}
            />
        </div>
    )
}
