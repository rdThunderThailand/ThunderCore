'use client'

import { useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter } from 'next/navigation'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FolderIcon, AlertTriangle, Loader2 } from 'lucide-react'
import { deleteAssetFolder } from '../actions'
import { useAssetStore } from '@/store/useAssetStore'
import { toast } from 'sonner'

interface DeleteFolderModalProps {
    isOpen: boolean
    onClose: () => void
    tenantId: string
    folderId: string
    folderName: string
}

export function DeleteFolderModal({
    isOpen,
    onClose,
    tenantId,
    folderId,
    folderName
}: DeleteFolderModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { fetchData, setSelectedFolderId, selectedFolderId } = useAssetStore()

    if (!isOpen) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteAssetFolder(tenantId, folderId)

            // If the deleted folder was currently selected, reset to root
            if (selectedFolderId === folderId) {
                setSelectedFolderId(null)
            }

            await fetchData(tenantId, true)
            onClose()
            toast.success('Folder deleted successfully.')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete folder.')
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

                    <h2 className="text-xl font-black text-center text-slate-900 mb-2">Delete Folder</h2>
                    <p className="text-slate-500 text-center text-sm mb-6">
                        Are you sure you want to delete <span className="font-bold text-slate-800">&quot;{folderName}&quot;</span>?
                        Any assets inside this folder will be moved to the root All Devices list.
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
