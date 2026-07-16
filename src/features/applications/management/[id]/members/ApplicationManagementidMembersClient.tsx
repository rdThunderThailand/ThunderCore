'use client'

import { ApplicationDetails } from '@/models/Application'
import { AlertCircle, CheckCircle2, ChevronLeft, Loader2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getApplicationById, getApplicationMembers } from '../actions'
import { InviteMemberModal } from './components/InviteMemberModal'
import { MembersListHeader } from './components/MembersListHeader'
import { MembersTable } from './components/MembersTable'

interface AppMember {
    id: string
    name: string
    email: string
    role: string
    status: 'Active' | 'Pending'
    tenantName?: string
}

export function ApplicationManagementidMembersClient() {
    const params = useParams()
    const router = useRouter()
    const appId = params.id as string

    const [app, setApp] = useState<ApplicationDetails | null>(null)
    const [members, setMembers] = useState<AppMember[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [inviteForm, setInviteForm] = useState({
        email: '',
        role: 'Viewer'
    })

    useEffect(() => {
        loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId])

    const loadData = async () => {
        try {
            setIsLoading(true)
            const [appData, membersData] = await Promise.all([
                getApplicationById(appId),
                getApplicationMembers(appId)
            ])

            if (!appData) {
                router.push('/dashboard/application')
                return
            }

            setApp(appData)
            setMembers(membersData as AppMember[])
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError('Failed to load members')
        } finally {
            setIsLoading(false)
        }
    }

    const handleInvite = async () => {
        if (!inviteForm.email.trim()) {
            setError('Email is required')
            return
        }

        const newMember: AppMember = {
            id: Date.now().toString(),
            name: inviteForm.email.split('@')[0],
            email: inviteForm.email,
            role: inviteForm.role,
            status: 'Pending'
        }

        setMembers([...members, newMember])
        setShowInviteModal(false)
        setInviteForm({ email: '', role: 'Viewer' })
        setSuccess('Invitation sent!')
        setTimeout(() => setSuccess(null), 3000)
    }

    const handleRemove = (memberId: string) => {
        setMembers(members.filter(m => m.id !== memberId))
        setActiveDropdown(null)
        setSuccess('Member removed')
        setTimeout(() => setSuccess(null), 3000)
    }

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-4 text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <p>{success}</p>
                </div>
            )}

            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
            >
                <ChevronLeft className="w-4 h-4" />
                Back
            </button>

            <MembersListHeader
                appName={app?.name || ''}
                onInviteClick={() => setShowInviteModal(true)}
            />

            <MembersTable
                members={filteredMembers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                onRemoveMember={handleRemove}
            />

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
