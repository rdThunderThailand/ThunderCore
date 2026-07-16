'use client'

import { MonitorSmartphone, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface LinkedDevice {
    id: string
    tenant_id: string
    serial_number: string | null
    mac_address: string | null
    hardware_model: string | null
    device_type: string | null
    is_active: boolean
}

// Ensure this component receives an array of devices
export function LinkedDevicesList({ devices, tenantId, assetId }: { devices: LinkedDevice[], tenantId: string, assetId: string }) {
    const router = useRouter()

    if (!devices || devices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
                <MonitorSmartphone className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">No Devices Linked</h3>
                <p className="text-xs text-slate-500 mt-1">There are no physical devices connected to this asset.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
                <div key={device.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <MonitorSmartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{device.hardware_model || device.device_type || 'Unknown Device'}</h4>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{device.mac_address || device.serial_number || 'N/A'}</div>
                            </div>
                        </div>
                        {device.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                            </span>
                        )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                            onClick={() => router.push(`/dashboard/tenants/management/${tenantId}/assets/${assetId}/devices/${device.id}`)}
                            className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Configure
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
