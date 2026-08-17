'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { deleteAsset } from '../actions'
import { useAssetStore } from '@/store/useAssetStore'
import { toast } from 'sonner'
import type { Asset } from '@/types/assets'

interface DeleteAssetModalProps {
    isOpen: boolean
    onClose: () => void
    tenantId: string
    asset: Asset
    onSuccess?: () => void
}

export function DeleteAssetModal({
    isOpen,
    onClose,
    tenantId,
    asset,
    onSuccess
}: DeleteAssetModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { fetchV2Assets } = useAssetStore()

    if (!isOpen) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteAsset(tenantId, asset.id)
            await fetchV2Assets(tenantId) // Re-fetch the V2 sidebar assets
            if (onSuccess) onSuccess()
            onClose()
            toast.success('Asset deleted successfully.')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete asset.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>

                    <h2 className="text-xl font-black text-center text-slate-900 mb-2">Delete Asset</h2>
                    <p className="text-slate-500 text-center text-sm mb-6">
                        Are you sure you want to delete <span className="font-bold text-slate-800">&quot;{asset.name || asset.device_name}&quot;</span>?
                        This will permanently remove the asset and all its linked devices.
                    </p>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
