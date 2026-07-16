'use client'

import { useState } from "react"
import { updateDevice } from "./actions" 
import { toast } from "sonner"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"

// Assuming a basic Device type based on LinkedDevice structure + mock preferences
export interface DeviceConfig {
    id: string
    tenant_id: string
    serial_number: string | null
    mac_address: string | null
    hardware_model: string | null
    device_type: string | null
    is_active: boolean
    // These might go into a metadata JSONB column, or specific columns in devices table
    metadata?: {
        screen_ratio?: string
        screen_dimension?: string
        app_version?: string
        ip_address?: string
    }
}

export function DeviceConfigForm({ device, tenantId, assetId }: { device: DeviceConfig, tenantId: string, assetId: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Fallbacks for data that used to be blindly attached to Asset
    const [formData, setFormData] = useState({
        mac_address: device.mac_address || '',
        screen_ratio: device.metadata?.screen_ratio || '16:9',
        screen_dimension: device.metadata?.screen_dimension || '1920x1080',
        app_version: device.metadata?.app_version || '',
        ip_address: device.metadata?.ip_address || '',
    })

    const handleSave = async () => {
        try {
            setIsLoading(true)
            await updateDevice(tenantId, device.id, formData)
            toast.success('Successfully updated device properties')
            router.refresh()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(error.message || 'Failed to update device')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col flex-1 h-full w-full space-y-8 max-w-3xl">
            <div className="flex justify-end gap-3 mb-6">
                <button
                    onClick={() => router.push(`/dashboard/tenants/management/${tenantId}/assets/${assetId}`)}
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
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Hardware Properties</h3>
                    <div className="grid grid-cols-[180px_400px] gap-y-6 items-center">

                        <label className="text-sm text-slate-500 font-medium">MAC address</label>
                        <input
                            type="text"
                            value={formData.mac_address}
                            onChange={e => setFormData(prev => ({ ...prev, mac_address: e.target.value }))}
                            className="w-[400px] px-4 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                            placeholder="00:00:00:00:00:00"
                        />

                        <label className="text-sm text-slate-500 font-medium">IP Address</label>
                        <input
                            type="text"
                            value={formData.ip_address}
                            onChange={e => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                            className="w-[400px] px-4 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                            placeholder="192.168.1.100"
                        />

                        <label className="text-sm text-slate-500 font-medium">App version</label>
                        <input
                            type="text"
                            value={formData.app_version}
                            onChange={e => setFormData(prev => ({ ...prev, app_version: e.target.value }))}
                            className="w-[400px] px-4 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                            placeholder="v1.0.0"
                        />

                        <label className="text-sm text-slate-500 font-medium">Screen Ratio</label>
                        <select
                            value={formData.screen_ratio}
                            onChange={e => setFormData(prev => ({ ...prev, screen_ratio: e.target.value }))}
                            className="w-[400px] px-4 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                            <option value="16:9">16:9</option>
                            <option value="4:3">4:3</option>
                            <option value="1:1">1:1</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </select>

                        <label className="text-sm text-slate-500 font-medium">Screen Dimension</label>
                        <select
                            value={formData.screen_dimension}
                            onChange={e => setFormData(prev => ({ ...prev, screen_dimension: e.target.value }))}
                            className="w-[400px] px-4 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        >
                            <option value="1920x1080">1920 x 1080</option>
                            <option value="1080x1920">1080 x 1920</option>
                            <option value="3840x2160">3840 x 2160 (4K)</option>
                            <option value="1280x720">1280 x 720</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}
