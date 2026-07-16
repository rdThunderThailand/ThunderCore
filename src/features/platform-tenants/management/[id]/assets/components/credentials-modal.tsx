import { Asset, DeviceCredentials } from '@/types/assets'
import { Loader2, Shield, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAssetCredentials } from '../actions'
import { CredentialDisplay } from './credential-display'
import { ModalOverlay } from './shared'

export function CredentialsModal({ tenantId, asset, onClose }: {
    tenantId: string; asset: Asset; onClose: () => void
}) {
    const [credentials, setCredentials] = useState<DeviceCredentials | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getAssetCredentials(tenantId, asset.id)
            .then(setCredentials)
            .catch(() => setCredentials(null))
            .finally(() => setIsLoading(false))
    }, [tenantId, asset.id])

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Device Credentials</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">{asset.device_name || asset.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
                ) : !credentials ? (
                    <div className="text-center py-8">
                        <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">No credentials found.</p>
                    </div>
                ) : (
                    <>
                        {credentials.is_revoked && (
                            <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-black text-red-700">Credentials Revoked</p>
                                    <p className="text-[10px] font-bold text-red-500">Revoked on {new Date(credentials.revoked_at!).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}
                        <CredentialDisplay credentials={credentials} />
                    </>
                )}

                <button onClick={onClose} className="w-full mt-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">
                    Close
                </button>
            </div>
        </ModalOverlay>
    )
}
