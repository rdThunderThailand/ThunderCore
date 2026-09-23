import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

// ponytail: static page, no guard — it must render for anyone rbac.ts turns away.
// Says nothing about what was requested, so it can't confirm a resource exists.

export default function NoAccessPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                <ShieldAlert className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">You don&apos;t have access to this page</h1>
            <p className="max-w-md text-slate-500">
                Your account doesn&apos;t have the permissions required. Ask an administrator if you think this is a
                mistake.
            </p>
            <Link
                href="/dashboard"
                className="mt-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
                Back to dashboard
            </Link>
        </div>
    )
}
