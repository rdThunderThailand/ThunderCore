import { CreateAssetInput, TenantQuota } from '@/types/assets'
import { AlertTriangle, Eye, EyeOff, ImagePlus, LayoutGrid, Loader2, Paperclip, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { createAsset } from '../actions'
import { FormField, ModalOverlay } from './shared'

export function RegisterModal({ tenantId, quota, onClose, onSuccess }: {
    tenantId: string; quota: TenantQuota; onClose: () => void; onSuccess: () => void
}) {
    const [formData, setFormData] = useState<CreateAssetInput>({
        device_name: '', model: '', serial_number: '', mac_address: '', activation_code: '', tags: []
    })
    const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null)
    const [showActivationCode, setShowActivationCode] = useState(false)
    const [isAddingTag, setIsAddingTag] = useState(false)
    const [newTagValue, setNewTagValue] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImagePreview({ url: URL.createObjectURL(file), name: file.name })
    }

    const handleRemoveImage = () => {
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleAddTag = () => {
        if (!newTagValue.trim()) { setIsAddingTag(false); return }
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTagValue.trim()] }))
        setIsAddingTag(false)
        setNewTagValue('')
    }

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await createAsset(tenantId, { ...formData, image_url: imagePreview?.url })
            toast.success('Success! asset/device has been added.')
            onSuccess()
            onClose()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to add device')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ModalOverlay onClose={onClose}>
            <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                            <LayoutGrid className="w-4.5 h-4.5" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Add Device</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {quota.remaining <= 10 && (
                    <p className={`text-xs font-bold mb-4 ${quota.remaining <= 3 ? 'text-red-500' : 'text-amber-500'}`}>
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {quota.remaining} quota slots remaining
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-start gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors shrink-0 overflow-hidden"
                        >
                            {imagePreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imagePreview.url} alt="Device preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    <span className="text-[11px] font-bold">Upload</span>
                                </>
                            )}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <div className="flex-1 min-w-0 pt-1">
                            {imagePreview ? (
                                <div className="flex items-center gap-2 min-w-0">
                                    <Paperclip className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span className="text-sm font-bold text-blue-600 truncate">{imagePreview.name}</span>
                                    <button type="button" onClick={handleRemoveImage} className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <ImagePlus className="w-3.5 h-3.5" />
                                    <span className="text-xs font-semibold">No image selected</span>
                                </div>
                            )}
                            <p className="text-xs text-slate-400 font-medium mt-1">Recommended: 400x400px</p>
                        </div>
                    </div>

                    <FormField label="Device Name" required>
                        <input required type="text" placeholder="Enter device name"
                            value={formData.device_name} onChange={e => setFormData({ ...formData, device_name: e.target.value })}
                            className="form-input" />
                    </FormField>

                    <FormField label="Model/Type">
                        <input type="text" placeholder="Enter model/type"
                            value={formData.model || ''} onChange={e => setFormData({ ...formData, model: e.target.value })}
                            className="form-input" />
                    </FormField>

                    <FormField label="Serial Number">
                        <input type="text" placeholder="Enter Serial Number"
                            value={formData.serial_number || ''} onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                            className="form-input" />
                    </FormField>

                    <FormField label="MAC Address">
                        <input type="text" placeholder="Enter MAC address"
                            value={formData.mac_address || ''} onChange={e => setFormData({ ...formData, mac_address: e.target.value })}
                            className="form-input" />
                    </FormField>

                    <FormField label="Activation Code">
                        <div className="relative">
                            <input type={showActivationCode ? 'text' : 'password'} placeholder="Enter activation code"
                                value={formData.activation_code || ''} onChange={e => setFormData({ ...formData, activation_code: e.target.value })}
                                className="form-input pr-12" />
                            <button
                                type="button"
                                onClick={() => setShowActivationCode(!showActivationCode)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showActivationCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </FormField>

                    <div className="flex items-center gap-2 flex-wrap">
                        {(formData.tags || []).map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-semibold text-blue-600">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-300 hover:text-blue-600">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        {isAddingTag ? (
                            <input
                                autoFocus
                                type="text"
                                value={newTagValue}
                                onChange={(e) => setNewTagValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); handleAddTag() }
                                    if (e.key === 'Escape') setIsAddingTag(false)
                                }}
                                onBlur={handleAddTag}
                                placeholder="Tag name"
                                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 outline-none w-24"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAddingTag(true)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 border border-dashed border-slate-200 hover:border-blue-400 hover:text-blue-500 transition-all"
                            >
                                <Plus className="w-3 h-3" /> New Tag
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || quota.remaining <= 0}
                            className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add Device
                        </button>
                    </div>
                </form>
            </div>
        </ModalOverlay>
    )
}
