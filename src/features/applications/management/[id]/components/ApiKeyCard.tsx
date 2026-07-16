'use client'

import { Copy, RefreshCw, Zap } from 'lucide-react'

interface ApiKeyCardProps {
    apiKey: string
    showApiKey: boolean
    onCopy: () => void
    onRegenerate: () => Promise<void>
}

export function ApiKeyCard({ apiKey, showApiKey, onCopy, onRegenerate }: ApiKeyCardProps) {
    return (
        <div className="bg-violet-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-violet-200 relative overflow-hidden group h-full">
            <div className="relative z-10">
                <h3 className="text-xl font-black mb-2">API Configuration</h3>
                <p className="text-violet-100 text-sm mb-6 opacity-80">Use this token to authenticate your application requests.</p>
                <div
                    onClick={onCopy}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 font-mono text-xs break-all border border-white/20 select-all cursor-pointer hover:bg-white/20 transition-all flex items-center gap-2"
                >
                    <span className="flex-1">{showApiKey ? apiKey : 'thunder_app_pk_••••••••••••••••'}</span>
                    <Copy className="w-4 h-4 flex-shrink-0" />
                </div>
                <button
                    onClick={onRegenerate}
                    className="mt-4 w-full py-3 bg-white/20 rounded-xl text-sm font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Key
                </button>
            </div>
            <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />
        </div>
    )
}
