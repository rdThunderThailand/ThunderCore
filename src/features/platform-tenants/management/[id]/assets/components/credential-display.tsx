import { DeviceCredentials } from '@/types/assets'
import { Copy, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
export function CredentialDisplay({ credentials }: { credentials: DeviceCredentials }) {
    const [showToken, setShowToken] = useState(false)

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        alert(`${label} copied to clipboard!`)
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Token</p>
                    <div className="flex gap-1">
                        <button onClick={() => setShowToken(!showToken)} className="p-1.5 rounded-lg hover:bg-white transition-colors">
                            {showToken ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                        </button>
                        <button onClick={() => copyToClipboard(credentials.access_token, 'Access Token')} className="p-1.5 rounded-lg hover:bg-white transition-colors">
                            <Copy className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
                <p className="font-mono text-sm font-bold text-slate-700 break-all">
                    {showToken ? credentials.access_token : '•'.repeat(32)}
                </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MQTT Client ID</p>
                    <button onClick={() => copyToClipboard(credentials.mqtt_client_id, 'MQTT Client ID')} className="p-1.5 rounded-lg hover:bg-white transition-colors">
                        <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
                <p className="font-mono text-sm font-bold text-slate-700 break-all">{credentials.mqtt_client_id}</p>
            </div>
        </div>
    )
}
