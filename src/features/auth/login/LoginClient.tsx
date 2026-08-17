'use client'

import { AlertCircle, Loader2 } from 'lucide-react'
import Link from "next/link"
import { useActionState, useState } from "react"
import { login } from "@/features/auth/actions"
import AuthShell from "@/features/auth/components/AuthShell"
import EmailField from "@/features/auth/components/EmailField"
import PasswordField from "@/features/auth/components/PasswordField"

export default function LoginClient() {
    const [state, formAction, isPending] = useActionState(login, {})
    const [rememberMe, setRememberMe] = useState(false)

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Please enter your details to sign in to your dashboard."
            brandName="Thunder"
            headerLink={{ href: "/register", label: "Create account" }}
            footer={
                <div className="mt-6 text-center">
                    <p className="text-[11px] text-slate-400 leading-relaxed px-4">
                        By continuing, you agree to our <a href="/terms" className="text-[#1677ff] hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#1677ff] hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            }
        >
            <form action={formAction} className="space-y-4">
                {state.error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg animate-in fade-in zoom-in duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p>{state.error}</p>
                    </div>
                )}

                <EmailField error={state.fieldErrors?.email} />
                <PasswordField error={state.fieldErrors?.password} />

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#1677ff] border-[#1677ff]' : 'bg-white border-slate-300 group-hover:border-[#1677ff]'}`}>
                            <input
                                type="checkbox"
                                name="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="sr-only"
                            />
                            {rememberMe && <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-white stroke-[3px]"><path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className="text-slate-600 text-sm font-medium">Remember</span>
                    </label>
                    <Link href="/forget-password" className="text-[#1677ff] text-xs font-semibold hover:underline">Forgot password?</Link>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-10 bg-[#1677ff] text-white rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:translate-y-[1px] mt-2"
                >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span className="text-sm">{isPending ? 'Signing in...' : 'Sign In'}</span>
                </button>
            </form>
        </AuthShell>
    )
}
