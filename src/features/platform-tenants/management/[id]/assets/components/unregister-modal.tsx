import { Asset, DataRetentionPolicy } from '@/types/assets'
import { AlertTriangle, FileText, Loader2, Trash2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { unregisterAsset } from '../actions'
import { ModalOverlay } from './shared'

export function UnregisterModal({ tenantId, asset, onClose, onSuccess }: {
    tenantId: string; asset: Asset; onClose: () => void; onSuccess: () => void
}) {
    const [dataRetention, setDataRetention] = useState<DataRetentionPolicy>('archive')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUnregister = async () => {
        setIsSubmitting(true)
        try {
            await unregisterAsset(tenantId, { assetId: asset.id, dataRetention })
            onSuccess()
            onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(error.message || 'Failed to unregister device')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Unregister Device</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2">
                        This will revoke all credentials and disconnect <span className="text-slate-900">{asset.device_name || asset.name}</span>.
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Historical Data Policy</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setDataRetention('archive')}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${dataRetention === 'archive'
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            <FileText className={`w-5 h-5 mb-2 ${dataRetention === 'archive' ? 'text-violet-600' : 'text-slate-300'}`} />
                            <p className="text-sm font-black text-slate-900">Archive</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">Keep historical data for review</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDataRetention('delete')}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${dataRetention === 'delete'
                                ? 'border-red-500 bg-red-50'
                                : 'border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            <Trash2 className={`w-5 h-5 mb-2 ${dataRetention === 'delete' ? 'text-red-600' : 'text-slate-300'}`} />
                            <p className="text-sm font-black text-slate-900">Delete All</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">Remove device and all data</p>
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleUnregister}
                        disabled={isSubmitting}
                        className="flex-1 py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                        Unregister
                    </button>
                </div>
            </div>
        </ModalOverlay>
    )
}
