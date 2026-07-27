'use client'

import { useApplicationStore } from '@/store/useApplicationStore'
import { KeyRound, Copy, RefreshCw, Eye, EyeOff, CheckCheck, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

interface ApiKeySectionProps {
    appId: string
}

export function ApiKeySection({ appId }: ApiKeySectionProps) {
    const { apiKey: apiKeyRecord, isApiKeyLoading: isLoading, fetchApiKey, regenerateApplicationApiKey } = useApplicationStore()
    const apiKey = apiKeyRecord?.api_key ?? null
    const generatedAt = apiKeyRecord?.api_key_generated_at ?? null
    const [isVisible, setIsVisible] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmRegenerate, setConfirmRegenerate] = useState(false)
    const [isKeyLoaded, setIsKeyLoaded] = useState(false)

    const handleReveal = async () => {
        if (isKeyLoaded) {
            setIsVisible(!isVisible)
            return
        }
        setError(null)
        try {
            await fetchApiKey(appId)
            setIsKeyLoaded(true)
            setIsVisible(true)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const handleGenerate = async () => {
        if (apiKey && !confirmRegenerate) {
            setConfirmRegenerate(true)
            return
        }
        setError(null)
        setConfirmRegenerate(false)
        try {
            await regenerateApplicationApiKey(appId)
            setIsKeyLoaded(true)
            setIsVisible(true)
        } catch (e) {
            setError((e as Error).message)
        }
    }

    const handleCopy = async () => {
        if (!apiKey) return
        await navigator.clipboard.writeText(apiKey)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    const maskedKey = apiKey
        ? `tk_${'•'.repeat(20)}...${apiKey.slice(-6)}`
        : null

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">API Key</h2>
                    <p className="text-xs text-slate-500">สำหรับการเชื่อมต่อแบบ Machine-to-Machine จาก External Projects</p>
                </div>
            </div>

            {/* Key display */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm flex items-center gap-3">
                {isKeyLoaded ? (
                    <span className="flex-1 text-slate-700 break-all select-all">
                        {isVisible ? apiKey : maskedKey}
                    </span>
                ) : (
                    <span className="flex-1 text-slate-400 italic text-xs">
                        คลิก &quot;แสดง Key&quot; เพื่อดู API Key หรือ &quot;สร้าง Key ใหม่&quot; หากยังไม่มี
                    </span>
                )}

                {isKeyLoaded && apiKey && (
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setIsVisible(!isVisible)}
                            title={isVisible ? 'ซ่อน' : 'แสดง'}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleCopy}
                            title="คัดลอก"
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                            {isCopied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>

            {generatedAt && (
                <p className="text-xs text-slate-400">
                    สร้างล่าสุด: {new Date(generatedAt).toLocaleString('th-TH')}
                </p>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Confirm regenerate warning */}
            {confirmRegenerate && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-amber-800 font-medium">⚠️ คำเตือน</p>
                    <p className="text-xs text-amber-700">
                        การสร้าง API Key ใหม่จะทำให้ Key เดิมใช้ไม่ได้ทันที
                        External Project ทั้งหมดที่ใช้ Key เดิมจะต้องอัปเดต Key ใหม่ด้วย
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-60"
                        >
                            {isLoading ? 'กำลังสร้าง...' : 'ยืนยัน — สร้าง Key ใหม่'}
                        </button>
                        <button
                            onClick={() => setConfirmRegenerate(false)}
                            className="px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            {/* Actions */}
            {!confirmRegenerate && (
                <div className="flex gap-3">
                    {!isKeyLoaded && (
                        <button
                            onClick={handleReveal}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60"
                        >
                            <Eye className="w-4 h-4" />
                            {isLoading ? 'กำลังโหลด...' : 'แสดง API Key'}
                        </button>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm shadow-blue-100"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'กำลังสร้าง...' : apiKey ? 'Regenerate API Key' : 'สร้าง API Key'}
                    </button>
                </div>
            )}

            <div className="border-t border-slate-100 pt-4 space-y-1">
                <p className="text-xs font-semibold text-slate-500">วิธีใช้งานใน External Project:</p>
                <pre className="text-xs bg-slate-900 text-emerald-400 rounded-lg px-4 py-3 overflow-x-auto">{`THUNDER_APP_API_KEY=tk_...   # ใส่ใน .env (ห้ามใช้ NEXT_PUBLIC_)`}</pre>
            </div>
        </div>
    )
}
