'use client'

import { useState } from 'react'
import { FolderIcon, Loader2 } from 'lucide-react'
import { moveAssetFolder } from '../actions'
import { useAssetStore } from '@/store/useAssetStore'
import { toast } from 'sonner'

interface MoveFolderModalProps {
    isOpen: boolean
    onClose: () => void
    tenantId: string
    folderId: string
    currentParentId: string | null
    folderName: string
}

export function MoveFolderModal({
    isOpen,
    onClose,
    tenantId,
    folderId,
    currentParentId,
    folderName
}: MoveFolderModalProps) {
    const [selectedParentId, setSelectedParentId] = useState<string | null>(currentParentId)
    const [isSaving, setIsSaving] = useState(false)
    const { folders, fetchData } = useAssetStore()

    // Prevent a folder from being moved into itself or its own descendants (simplified validation for now)
    const validFolders = folders.filter(f => f.id !== folderId && f.parent_id !== folderId)

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        // If no change, just close
        if (selectedParentId === currentParentId) {
            onClose()
            return
        }

        setIsSaving(true)
        try {
            await moveAssetFolder(tenantId, folderId, selectedParentId)
            await fetchData(tenantId, true)
            onClose()
            toast.success('Folder moved successfully.')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to move folder.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleSave} className="p-6">
                    <h2 className="text-xl font-black text-slate-900 mb-2">Move Folder</h2>
                    <p className="text-sm font-bold text-slate-500 mb-6">Where do you want to move &quot;{folderName}&quot;?</p>

                    <div className="mb-6 space-y-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg p-2 bg-slate-50">
                        {/* Option for Root Level */}
                        <label className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedParentId === null ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-100 border border-transparent'}`}>
                            <input
                                type="radio"
                                name="parentFolder"
                                className="hidden"
                                checked={selectedParentId === null}
                                onChange={() => setSelectedParentId(null)}
                            />
                            <FolderIcon className={`w-4 h-4 ${selectedParentId === null ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className={`text-sm ${selectedParentId === null ? 'font-bold text-indigo-900' : 'font-medium text-slate-700'}`}>
                                Top Level (Root)
                            </span>
                        </label>

                        {/* List Valid Folders */}
                        {validFolders.map(folder => (
                            <label key={folder.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selectedParentId === folder.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-100 border border-transparent'}`}>
                                <input
                                    type="radio"
                                    name="parentFolder"
                                    className="hidden"
                                    checked={selectedParentId === folder.id}
                                    onChange={() => setSelectedParentId(folder.id)}
                                />
                                <FolderIcon className={`w-4 h-4 ${selectedParentId === folder.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <span className={`text-sm ${selectedParentId === folder.id ? 'font-bold text-indigo-900' : 'font-medium text-slate-700'}`}>
                                    {folder.name}
                                </span>
                            </label>
                        ))}
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
                            Move
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
