import { FolderPlus, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { createAssetFolder } from '../actions';
import { FormField, ModalOverlay } from './shared';

export function CreateFolderModal({ tenantId, parentId, onClose, onSuccess }: { tenantId: string; parentId?: string | null; onClose: () => void; onSuccess: () => void }) {
    const [name, setName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsSubmitting(true)
        try {
            await createAssetFolder(tenantId, { name, parent_id: parentId })
            onSuccess()
            onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(error.message || 'Failed to create folder')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-blue-500" /> New Folder
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Folder Name" required>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Production Devices"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            autoFocus
                        />
                    </FormField>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Folder'}
                    </button>
                </form>
            </div>
        </ModalOverlay>
    )
}
