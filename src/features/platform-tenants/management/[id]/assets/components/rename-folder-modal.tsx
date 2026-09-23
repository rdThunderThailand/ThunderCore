'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { renameAssetFolder } from '../actions'
import { useAssetStore } from '@/store/useAssetStore'
import { toast } from 'sonner'

interface RenameFolderModalProps {
    isOpen: boolean
    onClose: () => void
    tenantId: string
    folderId: string
    initialName: string
}

export function RenameFolderModal({
    isOpen,
    onClose,
    tenantId,
    folderId,
    initialName
}: RenameFolderModalProps) {
    const [name, setName] = useState(initialName)
    const [isSaving, setIsSaving] = useState(false)
    const { fetchData } = useAssetStore()

    useEffect(() => {
        if (isOpen) {
            setName(initialName)
        }
    }, [isOpen, initialName])

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || name.trim() === initialName) {
            onClose()
            return
        }

        setIsSaving(true)
        try {
            await renameAssetFolder(tenantId, folderId, name)
            await fetchData(tenantId, true)
            onClose()
            toast.success('Folder renamed successfully.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to rename folder.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleSave} className="p-6">
                    <h2 className="text-xl font-black text-slate-900 mb-6">Rename Folder</h2>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Folder Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
