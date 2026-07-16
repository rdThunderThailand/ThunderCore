import { getAdminClient } from "@/utils/supabase/admin"
import { requireAdmin } from "@/utils/auth-context"
import { notFound } from "next/navigation"
import { DeviceConfigForm } from "./device-config-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export async function TenantsManagementidAssetsassetIdDevicesdeviceIdClient(props: {
    params: Promise<{ id: string, assetId: string, deviceId: string }>
}) {
    const { supabase } = await requireAdmin()
    const { id: tenantId, assetId, deviceId } = await props.params

    const { data: device, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .eq('tenant_id', tenantId)
        .single()

    if (error || !device) {
        notFound()
    }

    // Also get asset for breadcrumb/title context
    const { data: asset } = await supabase
        .from('assets')
        .select('name, device_name')
        .eq('id', assetId)
        .single()

    const assetName = asset?.device_name || asset?.name || 'Asset'

    return (
        <div className="flex flex-col h-full gap-8">
            <div>
                <Link
                    href={`/dashboard/tenants/management/${tenantId}/assets/${assetId}`}
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {assetName}
                </Link>

                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Device Configuration</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {device.hardware_model || device.device_type || 'Unknown Device'} • {device.mac_address || device.serial_number || 'No identifier'}
                        </p>
                    </div>
                </div>

                <DeviceConfigForm device={device} tenantId={tenantId} assetId={assetId} />
            </div>
        </div>
    )
}
