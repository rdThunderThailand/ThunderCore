import { Asset, DeviceCredentials } from '@/types/assets'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Copy, Download, Loader2, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { getAssetCredentials } from '../actions'
import { ModalOverlay } from './shared'

export function ActivationModal({ tenantId, asset, onClose }: {
    tenantId: string; asset: Asset; onClose: () => void
}) {
    const [activationCode, setActivationCode] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [credentials, setCredentials] = useState<DeviceCredentials | null>(null)

    const handleRetrieve = async () => {
        setIsLoading(true)
        try {
            const creds = await getAssetCredentials(tenantId, asset.id)
            if (creds) {
                setCredentials(creds)
                setActivationCode(creds.access_token)
            } else {
                alert('No credentials found for this device.')
            }
        } catch (error) {
            console.error(error)
            alert('Failed to retrieve activation code')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white w-full max-w-lg rounded-[1.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-blue-600 fill-current" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Activation Code</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Device Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Device Name</label>
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                            {asset.device_name || asset.name}
                        </div>
                    </div>

                    {/* Player ID */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Device ID</label>
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 font-mono text-sm">
                            {asset.id}
                        </div>
                    </div>

                    {/* MAC Address */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">MAC Address</label>
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 font-mono text-sm">
                            {asset.mac_address || 'N/A'}
                        </div>
                    </div>

                    {/* Activation Code */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Activation Code</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={activationCode || ''}
                                    placeholder="Retrieve activation code"
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none"
                                />
                                {activationCode && (
                                    <button
                                        onClick={() => copyToClipboard(activationCode)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {!activationCode && (
                                <button
                                    onClick={handleRetrieve}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 whitespace-nowrap text-sm"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                                    Retrieve
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    )
}
