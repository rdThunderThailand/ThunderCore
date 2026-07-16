'use client'

import { Loader2, Zap } from 'lucide-react'
import { useActionState, useState } from "react"
import { registerAccount } from "@/features/auth/actions"
import AuthShell from "@/features/auth/components/AuthShell"
import EmailField from "@/features/auth/components/EmailField"
import PasswordField from "@/features/auth/components/PasswordField"

export default function RegisterClient() {
    const [state, formAction, isPending] = useActionState(registerAccount, {})
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [isTermsRead, setIsTermsRead] = useState(false);

    const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 10) setIsTermsRead(true);
    };

    return (
        <>
            <AuthShell
                title="Create an account"
                subtitle="CityZen Control your platform, handle emergency cases, and assist citizens."
                brandName="CITYZEN"
                headerLink={{ href: "/login", label: "Sign in" }}
            >
                <form action={formAction} className="space-y-4">
                    {state.error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{state.error}</div>}
                    
                    <EmailField error={state.fieldErrors?.email} />
                    <PasswordField error={state.fieldErrors?.password} />

                    <div className="space-y-3 pt-2">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <div className="flex items-center h-5 mt-0.5">
                                <input type="checkbox" name="consentTerms" disabled={!isTermsRead} className={`w-4 h-4 border rounded text-blue-600 focus:ring-blue-500 transition-colors ${!isTermsRead ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} ${state.fieldErrors?.consentTerms ? 'border-red-500' : 'border-slate-300'}`} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-700 font-medium">
                                    I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 hover:underline focus:outline-none">Terms of Service & Privacy Policy</button> <span className="text-red-500">*</span>
                                </span>
                                {!isTermsRead && <span className="text-[10px] text-amber-600 mt-0.5">Please click to read the terms to the end before checking this box.</span>}
                                {state.fieldErrors?.consentTerms && <span className="text-xs text-red-500 mt-1">{state.fieldErrors.consentTerms}</span>}
                            </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <div className="flex items-center h-5 mt-0.5">
                                <input type="checkbox" name="consentMarketing" className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-500 transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-700">I consent to receive marketing communications and product updates (Optional)</span>
                            </div>
                        </label>
                    </div>

                    <button type="submit" disabled={isPending} className="w-full mt-6 h-10 bg-[#1677ff] text-white rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:translate-y-[1px]">
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span className="text-sm">{isPending ? 'Signing up...' : 'Sign up with Email'}</span>
                    </button>
                </form>
            </AuthShell>
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold text-slate-900">Terms of Service & Privacy Policy</h2>
                            <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
                                <Zap className="w-5 h-5 hidden" />
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-600 space-y-4" onScroll={handleTermsScroll}>
                            <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-lg mb-4 text-xs font-medium sticky top-0 shadow-sm">Please scroll to the bottom to acknowledge you have read the terms.</div>
                            <h3 className="font-bold text-slate-900 text-base">1. Acceptance of Terms</h3><p>By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
                            <h3 className="font-bold text-slate-900 text-base mt-6">2. Privacy Policy & PDPA</h3><p>In accordance with the Personal Data Protection Act (PDPA), we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application.</p>
                            <h3 className="font-bold text-slate-900 text-base mt-6">3. Data Collection</h3><p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                            <ul className="list-disc pl-5 space-y-1"><li>Personal Data: Personally identifiable information, such as your name, email address, and demographic information.</li><li>Derivative Data: Information our servers automatically collect when you access the application, such as your IP address, browser type, and operating system.</li></ul>
                            <h3 className="font-bold text-slate-900 text-base mt-6">4. Use of Your Information</h3><p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
                            <ul className="list-disc pl-5 space-y-1"><li>Create and manage your account.</li><li>Email you regarding your account or order.</li><li>Fulfill and manage purchases, orders, payments, and other transactions related to the application.</li><li>Generate a personal profile about you to make future visits to the application more personalized.</li></ul>
                            <h3 className="font-bold text-slate-900 text-base mt-6">5. Data Subject Rights</h3><p>Under the PDPA, you have the right to access, rectify, delete, restrict processing, and object to the processing of your personal data. To exercise these rights, please contact our Data Protection Officer.</p>
                            <div className="h-10"></div>
                            <p className="text-center font-bold text-slate-400">--- End of Document ---</p>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
                            <button type="button" onClick={() => setShowTermsModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Close</button>
                            <button type="button" onClick={() => setShowTermsModal(false)} disabled={!isTermsRead} className={`px-5 py-2.5 text-sm font-bold text-white rounded-lg transition-colors flex items-center gap-2 ${isTermsRead ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20' : 'bg-slate-300 cursor-not-allowed'}`}>
                                {isTermsRead ? 'I have read the terms' : 'Please read to the end'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
