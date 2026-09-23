'use client'

import { Asset } from "@/types/assets"
import { useState } from "react"
import { updateAsset } from "../actions"
import { toast } from "sonner"
import { Save, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function PlayerPreferencesForm({ asset, tenantId }: { asset: Asset, tenantId: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        device_name: asset.device_name || asset.name || '',
        tags: asset.tags || []
    })

    const presetColors = [
        { name: 'Indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', value: 'indigo' },
        { name: 'Rose', bg: 'bg-rose-100', text: 'text-rose-700', value: 'rose' },
        { name: 'Emerald', bg: 'bg-emerald-100', text: 'text-emerald-700', value: 'emerald' },
        { name: 'Amber', bg: 'bg-amber-100', text: 'text-amber-700', value: 'amber' },
        { name: 'Sky', bg: 'bg-sky-100', text: 'text-sky-700', value: 'sky' },
    ]

    const [newTag, setNewTag] = useState('')
    const [selectedColor, setSelectedColor] = useState(presetColors[0].value)

    const handleSave = async () => {
        try {
            setIsLoading(true)
            await updateAsset(tenantId, asset.id, formData)
            toast.success('Successfully updated device preferences')
            router.refresh()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to update preferences')
        } finally {
            setIsLoading(false)
        }
    }

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault()
            const tagString = `${newTag.trim()}:::${selectedColor}`

            // Do not add if the raw tag name already exists
            const existingTagNames = formData.tags.map(t => t.split(':::')[0])
            if (!existingTagNames.includes(newTag.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagString] }))
            }
            setNewTag('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }))
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full space-y-8">
            <div className="flex justify-end gap-3 mb-6">
                <button
                    onClick={() => {
                        setFormData({
                            device_name: asset.device_name || asset.name || '',
                            tags: asset.tags || []
                        })
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save'}
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Device Info</h3>
                    <div className="grid grid-cols-[180px_400px] gap-y-6 items-center">

                        <label className="text-sm text-slate-500 font-medium">Asset Name</label>
                        <input
                            type="text"
                            value={formData.device_name}
                            onChange={e => setFormData(prev => ({ ...prev, device_name: e.target.value }))}
                            className="w-[400px] px-4 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            placeholder="Enter asset name"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 max-w-[580px]">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Tags</h3>

                    <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.tags.map(tag => {
                                const parts = tag.split(':::')
                                const tagName = parts[0]
                                const tagColorValue = parts[1] || 'indigo' // Default for old tags

                                const colorConfig = presetColors.find(c => c.value === tagColorValue) || presetColors[0]

                                return (
                                    <span key={tag} className={`inline-flex items-center gap-1.5 px-3 py-1 ${colorConfig.bg} ${colorConfig.text} text-xs font-bold rounded-md`}>
                                        {tagName}
                                        <button onClick={() => removeTag(tag)} className={`hover:opacity-70 transition-opacity`}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )
                            })}
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            {presetColors.map(color => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`w-6 h-6 rounded-full ${color.bg} border-2 transition-all ${selectedColor === color.value ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                                    title={color.name}
                                />
                            ))}
                        </div>

                        <input
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            onKeyDown={addTag}
                            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                            placeholder="Type a tag, select a color, and press Enter..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
