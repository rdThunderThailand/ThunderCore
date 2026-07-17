'use client'

import { Asset } from "@/types/assets"
import { useState } from "react"
import { updateAsset } from "../../actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeviceSettingsForm({ asset, tenantId }: { asset: Asset, tenantId: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        download_mode: asset.download_mode || 'Realtime',
        player_log_enable: asset.player_log_enable ?? true,
        player_log_days: asset.player_log_days ?? 90,
        transfer_log_enable: asset.transfer_log_enable ?? true,
        media_log_enable: asset.media_log_enable ?? true,
        media_log_days: asset.media_log_days ?? 80,
        media_log_mode: asset.media_log_mode || 'Realtime',
        capture_screen: asset.capture_screen ?? true,
        capture_period: asset.capture_period || '00:00:60',
        cctv_url: asset.cctv_url || '',
        location_url: asset.location_url || '',
        sync_media: asset.sync_media ?? true,
    })

    const handleSave = async () => {
        try {
            setIsLoading(true)
            await updateAsset(tenantId, asset.id, formData)
            toast.success('Successfully updated device settings')
            router.refresh()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to update settings')
        } finally {
            setIsLoading(false)
        }
    }

    // A reusable custom Switch component matching the purple mockup
    const CustomSwitch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-500' : 'bg-slate-300'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    )

    // A reusable custom Range Slider component matching the purple track
    const CustomSlider = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
        const percentage = (value / 100) * 100
        return (
            <div className="flex items-center gap-4 w-[400px]">
                <div className="relative flex-1 h-1.5 bg-slate-200 rounded-full">
                    <div
                        className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                </div>
                <div className="flex items-baseline gap-1 min-w-[50px] justify-end">
                    <span className="text-sm font-bold text-slate-700">{value}</span>
                    <span className="text-xs text-slate-400">Day</span>
                </div>
            </div>
        )
    }

    const isEmbeddable = (url: string) => {
        if (!url) return false;
        return url.includes('/embed') || url.includes('output=embed');
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full">
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h1 className="text-xl font-bold text-slate-800">Setting</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors border border-indigo-600 shadow-sm"
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="space-y-12 max-w-[600px] ml-12">
                {/* Download Mode */}
                <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Download Mode</h3>
                    <div className="grid grid-cols-[200px_1fr] items-center">
                        <label className="text-sm text-slate-400">Download Mode</label>
                        <select
                            value={formData.download_mode}
                            onChange={(e) => setFormData(prev => ({ ...prev, download_mode: e.target.value }))}
                            className="w-[200px] px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                            <option value="Realtime">Realtime</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>
                </div>

                {/* Log */}
                <div className="space-y-6">
                    <h3 className="text-base font-bold text-slate-800">Log</h3>

                    <div className="grid grid-cols-[200px_1fr] items-center">
                        <label className="text-sm text-slate-400">Player Log Enable</label>
                        <CustomSwitch
                            checked={formData.player_log_enable}
                            onChange={(v) => setFormData(prev => ({ ...prev, player_log_enable: v }))}
                        />
                    </div>
                    {formData.player_log_enable && (
                        <div className="grid grid-cols-[200px_1fr] items-center -mt-2">
                            <div />{/* indent */}
                            <CustomSlider
                                value={formData.player_log_days}
                                onChange={(v) => setFormData(prev => ({ ...prev, player_log_days: v }))}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-[200px_1fr] items-center pt-2">
                        <label className="text-sm text-slate-400">Transfer Log Enable</label>
                        <CustomSwitch
                            checked={formData.transfer_log_enable}
                            onChange={(v) => setFormData(prev => ({ ...prev, transfer_log_enable: v }))}
                        />
                    </div>

                    <div className="grid grid-cols-[200px_1fr] items-center pt-2">
                        <label className="text-sm text-slate-400">Media Log Enable</label>
                        <CustomSwitch
                            checked={formData.media_log_enable}
                            onChange={(v) => setFormData(prev => ({ ...prev, media_log_enable: v }))}
                        />
                    </div>
                    {formData.media_log_enable && (
                        <div className="grid grid-cols-[200px_1fr] items-center -mt-2">
                            <div />
                            <CustomSlider
                                value={formData.media_log_days}
                                onChange={(v) => setFormData(prev => ({ ...prev, media_log_days: v }))}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-[200px_1fr] items-center pt-2">
                        <label className="text-sm text-slate-400">Media Log Mode</label>
                        <select
                            value={formData.media_log_mode}
                            onChange={(e) => setFormData(prev => ({ ...prev, media_log_mode: e.target.value }))}
                            className="w-[200px] px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                            <option value="Realtime">Realtime</option>
                            <option value="Batch">Batch</option>
                        </select>
                    </div>
                </div>

                {/* Monitor */}
                <div className="space-y-6">
                    <h3 className="text-base font-bold text-slate-800">Monitor</h3>

                    <div className="grid grid-cols-[200px_1fr] items-center">
                        <label className="text-sm text-slate-400">Capture Screen</label>
                        <CustomSwitch
                            checked={formData.capture_screen}
                            onChange={(v) => setFormData(prev => ({ ...prev, capture_screen: v }))}
                        />
                    </div>

                    {formData.capture_screen && (
                        <div className="grid grid-cols-[200px_1fr] items-center">
                            <label className="text-sm text-slate-400">Capture Period</label>
                            <input
                                type="text"
                                value={formData.capture_period}
                                onChange={(e) => setFormData(prev => ({ ...prev, capture_period: e.target.value }))}
                                className="w-[120px] px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                placeholder="00:00:60"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-[200px_1fr] items-center">
                        <label className="text-sm text-slate-400">CCTV URL</label>
                        <input
                            type="text"
                            value={formData.cctv_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, cctv_url: e.target.value }))}
                            className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            placeholder="https://thunder.co.th/cctv"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Location</h3>

                    <div className="grid grid-cols-[200px_1fr] items-start">
                        <label className="text-sm text-slate-400 pt-3">Location</label>
                        <div className="space-y-3 relative w-full">
                            <input
                                type="text"
                                value={formData.location_url}
                                onChange={(e) => {
                                    let val = e.target.value
                                    // Extract src if user pastes an iframe embed HTML snippet from Google Maps
                                    const match = val.match(/src="([^"]+)"/)
                                    if (match) val = match[1]
                                    setFormData(prev => ({ ...prev, location_url: val }))
                                }}
                                className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                placeholder="Paste Google Maps 'Embed a map' HTML or direct link..."
                            />
                            {/* Static Map Image Placeholder like mockup */}
                            <div className="w-full h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                                {formData.location_url && isEmbeddable(formData.location_url) ? (
                                    <iframe
                                        src={formData.location_url}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-[url('https://maps.gstatic.com/mapfiles/maps_lite/pwa/t_10x_xx_hdpi.png')] bg-cover bg-center">
                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />
                                        <div className="z-10 flex flex-col items-center gap-2 bg-white/90 px-6 py-4 rounded-xl shadow-sm border border-slate-200 text-center">
                                            {formData.location_url && formData.location_url.startsWith('http') ? (
                                                <>
                                                    <span className="text-sm font-bold text-slate-800">Map Preview Unavailable</span>
                                                    <span className="text-xs text-slate-500 max-w-[200px] mb-1">Standard links cannot be embedded directly.</span>
                                                    <a
                                                        href={formData.location_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                                                    >
                                                        Open Link in New Tab
                                                    </a>
                                                </>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-700">Map Preview</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sync */}
                <div className="space-y-4 pb-20">
                    <h3 className="text-base font-bold text-slate-800">Sync</h3>

                    <div className="grid grid-cols-[200px_1fr] items-center">
                        <label className="text-sm text-slate-400">Sync Media</label>
                        <CustomSwitch
                            checked={formData.sync_media}
                            onChange={(v) => setFormData(prev => ({ ...prev, sync_media: v }))}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}
