import { getAdminClient } from "@/utils/supabase/admin"
import { requireAdmin } from "@/utils/auth-context"
import { notFound } from "next/navigation"
import { DeviceSettingsForm } from "./device-settings-form"

interface SettingPageProps {
    params: Promise<{
        id: string;
        assetId: string;
    }>
}

export async function TenantsManagementidAssetsassetIdSettingsClient({ params }: SettingPageProps) {
    const { id: tenantId, assetId } = await params;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userRole = await requireAdmin()

    const supabase = await getAdminClient()

    const { data: asset, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .eq('tenant_id', tenantId)
        .single()

    if (error || !asset) {
        return notFound()
    }

    // Role-based authorization if needed goes here

    return <DeviceSettingsForm asset={asset} tenantId={tenantId} />
}
