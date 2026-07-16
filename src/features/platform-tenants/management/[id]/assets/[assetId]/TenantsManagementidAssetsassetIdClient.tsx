// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAdminClient } from "@/utils/supabase/admin"
import { requireAdmin } from "@/utils/auth-context"
import { notFound } from "next/navigation"
import { PlayerPreferencesForm } from "./player-preferences-form"
import { getAssetActivityLogs, getAssetDevices } from "./actions"
import { AssetActivityTimeline } from "../components/asset-activity-timeline"
import { LinkedDevicesList } from "../components/linked-devices-list"

export async function TenantsManagementidAssetsassetIdClient(props: {
    params: Promise<{ id: string, assetId: string }>
}) {
    const { supabase } = await requireAdmin()
    const { id: tenantId, assetId } = await props.params

    const { data: asset, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .eq('tenant_id', tenantId)
        .single()

    if (error || !asset) {
        notFound()
    }

    const activityLogs = await getAssetActivityLogs(assetId)
    const linkedDevices = await getAssetDevices(assetId)

    return (
        <div className="flex flex-col h-full gap-8">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">General</h2>
                <PlayerPreferencesForm asset={asset} tenantId={tenantId} />
            </div>

            <div className="pt-6 border-t border-slate-100/60 max-w-3xl">
                <h2 className="text-xl font-bold text-slate-800 mb-8 pb-4">Linked Devices</h2>
                <LinkedDevicesList devices={linkedDevices} tenantId={tenantId} assetId={assetId} />
            </div>

            <div className="pt-6 border-t border-slate-100/60 max-w-3xl">
                <h2 className="text-xl font-bold text-slate-800 mb-8 pb-4">Activity Timeline</h2>
                <div className="max-w-3xl">
                    <AssetActivityTimeline logs={activityLogs} />
                </div>
            </div>
        </div>
    )
}
