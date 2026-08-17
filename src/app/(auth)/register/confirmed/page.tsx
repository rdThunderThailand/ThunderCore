import { ArrowRight, CheckCircle2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function RegisterConfirmedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-500">

                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center relative">
                        <Mail className="w-10 h-10 text-violet-600" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Check your email</h1>
                        <p className="text-slate-500 font-bold leading-relaxed">
                            We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
                    >
                        Return to Login
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <p className="text-xs font-bold text-slate-400">
                        Didn&apos;t receive an email? <button className="text-violet-600 hover:underline">Resend</button>
                    </p>
                </div>
            </div>
        </div>
    )
}
