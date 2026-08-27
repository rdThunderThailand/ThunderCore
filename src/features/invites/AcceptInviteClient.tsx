'use client'

import { logout } from '@/features/auth/actions'
import PasswordField from '@/features/auth/components/PasswordField'
import { InviteDetails } from '@/types/invites'
import { AlertCircle, CheckCircle2, Loader2, Mail, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import { acceptInvite, completeInviteSignup, CompleteInviteSignupState } from './actions'

const ROLE_LABELS: Record<string, string> = {
    admin_company: 'Company Admin',
    company_admin: 'Company Admin',
    department_admin: 'Department Admin',
    operator: 'Operator',
    viewer_auditor: 'Auditor',
}

function roleLabel(role: InviteDetails['role']): string {
    if (!role) return 'Member'
    return ROLE_LABELS[role.code] ?? role.name
}

export function AcceptInviteClient({
    token,
    invite,
    loadError,
    currentUserEmail,
}: {
    token: string
    invite: InviteDetails | null
    loadError: string | null
    currentUserEmail: string | null
}) {
    const router = useRouter()
    const [isAccepting, setIsAccepting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAccept = async () => {
        setIsAccepting(true)
        setError(null)
        try {
            await acceptInvite(token)
            router.push('/dashboard')
        } catch (err) {
            setError((err as Error).message)
            setIsAccepting(false)
        }
    }

    if (!invite) {
        return (
            <Card icon={<AlertCircle className="w-10 h-10 text-red-600" />} iconBg="bg-red-50" title="Invitation not found">
                <p className="text-slate-500 font-medium leading-relaxed">
                    {loadError ?? 'This invite link is invalid. Ask whoever invited you to send a new one.'}
                </p>
                <FooterLink href="/login" label="Return to login" />
            </Card>
        )
    }

    if (invite.status === 'accepted') {
        return (
            <Card icon={<CheckCircle2 className="w-10 h-10 text-emerald-600" />} iconBg="bg-emerald-50" title="Already accepted">
                <p className="text-slate-500 font-medium leading-relaxed">
                    This invitation has already been accepted. Sign in to reach your dashboard.
                </p>
                <FooterLink href="/login" label="Go to login" />
            </Card>
        )
    }

    if (invite.status === 'expired') {
        return (
            <Card icon={<AlertCircle className="w-10 h-10 text-amber-600" />} iconBg="bg-amber-50" title="Invitation expired">
                <p className="text-slate-500 font-medium leading-relaxed">
                    This invite link has expired. Ask {invite.tenant?.name ?? 'the tenant'} to send you a new one.
                </p>
                <FooterLink href="/login" label="Return to login" />
            </Card>
        )
    }

    if (invite.status === 'cancelled') {
        return (
            <Card icon={<AlertCircle className="w-10 h-10 text-slate-400" />} iconBg="bg-slate-100" title="Invitation cancelled">
                <p className="text-slate-500 font-medium leading-relaxed">
                    This invitation was cancelled by an admin. Ask them to send a new one if you still need access.
                </p>
                <FooterLink href="/login" label="Return to login" />
            </Card>
        )
    }

    // Signed in as a different email than the one invited — refuse rather than silently
    // accepting into the wrong account.
    if (currentUserEmail && currentUserEmail !== invite.email) {
        return (
            <Card icon={<AlertCircle className="w-10 h-10 text-amber-600" />} iconBg="bg-amber-50" title="Wrong account">
                <p className="text-slate-500 font-medium leading-relaxed">
                    This invite was sent to <span className="font-bold text-slate-700">{invite.email}</span>, but
                    you&apos;re signed in as <span className="font-bold text-slate-700">{currentUserEmail}</span>. Sign
                    out and sign back in with the invited email to continue.
                </p>
                <form action={logout} className="mt-2">
                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        Sign out
                    </button>
                </form>
            </Card>
        )
    }

    // Signed in as the matching email — ready to accept.
    if (currentUserEmail && currentUserEmail === invite.email) {
        return (
            <Card icon={<Zap className="w-10 h-10 text-blue-600" />} iconBg="bg-blue-50" title="You've been invited">
                <p className="text-slate-500 font-medium leading-relaxed">
                    Join <span className="font-bold text-slate-700">{invite.tenant?.name ?? 'this tenant'}</span> as{' '}
                    <span className="font-bold text-slate-700">{roleLabel(invite.role)}</span>.
                </p>
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-left">{error}</div>
                )}
                <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="w-full bg-[#1677ff] text-white py-3.5 px-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30"
                >
                    {isAccepting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isAccepting ? 'Joining...' : 'Accept & join'}
                </button>
            </Card>
        )
    }

    // Not signed in, and an account already exists for this email — nothing to fill in, just
    // sign in and reopen this same link to finish accepting.
    if (invite.has_account) {
        const nextParam = encodeURIComponent(`/invites/accept?token=${token}`)
        return (
            <Card icon={<Mail className="w-10 h-10 text-violet-600" />} iconBg="bg-violet-50" title="You've been invited">
                <p className="text-slate-500 font-medium leading-relaxed">
                    <span className="font-bold text-slate-700">{invite.tenant?.name ?? 'A tenant'}</span> invited{' '}
                    <span className="font-bold text-slate-700">{invite.email}</span> to join as{' '}
                    <span className="font-bold text-slate-700">{roleLabel(invite.role)}</span>.
                </p>
                <div className="space-y-3">
                    <Link
                        href={`/login?next=${nextParam}`}
                        className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg shadow-slate-200"
                    >
                        Sign in to accept
                    </Link>
                    <p className="text-xs font-bold text-slate-400">
                        After signing in, reopen this invite link to finish joining.
                    </p>
                </div>
            </Card>
        )
    }

    // Not signed in, no account yet — fill in name + password once and go straight to a
    // member of the tenant (register + log in + accept chained into a single submit).
    return <InviteSignupForm token={token} invite={invite} />
}

function InviteSignupForm({ token, invite }: { token: string; invite: InviteDetails }) {
    const [state, formAction, isPending] = useActionState<CompleteInviteSignupState, FormData>(completeInviteSignup, {})

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center gap-4 mb-8 text-center">
                    <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">You&apos;ve been invited</h1>
                        <p className="text-slate-500 font-medium leading-relaxed mt-2">
                            <span className="font-bold text-slate-700">{invite.tenant?.name ?? 'A tenant'}</span> invited
                            you to join as <span className="font-bold text-slate-700">{roleLabel(invite.role)}</span>.
                            Fill in your details to create your account and join.
                        </p>
                    </div>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="token" value={token} />
                    <input type="hidden" name="email" value={invite.email} />

                    {state.error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{state.error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="firstName" className="text-slate-700 text-sm font-bold ml-1">First Name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className={`w-full h-10 px-4 bg-white border rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${state.fieldErrors?.firstName ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {state.fieldErrors?.firstName && <p className="text-red-500 text-xs ml-1">{state.fieldErrors.firstName}</p>}
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="lastName" className="text-slate-700 text-sm font-bold ml-1">Last Name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className={`w-full h-10 px-4 bg-white border rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${state.fieldErrors?.lastName ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {state.fieldErrors?.lastName && <p className="text-red-500 text-xs ml-1">{state.fieldErrors.lastName}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-slate-700 text-sm font-bold ml-1">Email Address</label>
                        <input
                            type="email"
                            value={invite.email}
                            readOnly
                            className="w-full h-10 px-4 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-sm cursor-not-allowed font-medium"
                        />
                    </div>

                    <PasswordField error={state.fieldErrors?.password} />

                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="text-slate-700 text-sm font-bold ml-1">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder="Re-enter your password"
                            className={`w-full h-10 px-4 bg-white border rounded-lg text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${state.fieldErrors?.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {state.fieldErrors?.confirmPassword && <p className="text-red-500 text-xs ml-1">{state.fieldErrors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full mt-2 h-11 bg-[#1677ff] text-white rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span className="text-sm">{isPending ? 'Creating your account...' : 'Create account & join'}</span>
                    </button>
                </form>
            </div>
        </div>
    )
}

function Card({
    icon,
    iconBg,
    title,
    children,
}: {
    icon: React.ReactNode
    iconBg: string
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-500 space-y-6">
                <div className="flex flex-col items-center gap-6">
                    <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center`}>{icon}</div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
                </div>
                {children}
            </div>
        </div>
    )
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg shadow-slate-200"
        >
            {label}
        </Link>
    )
}
