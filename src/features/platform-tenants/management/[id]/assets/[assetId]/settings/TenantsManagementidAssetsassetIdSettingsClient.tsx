import { notFound } from "next/navigation"
import { getAsset } from "../../actions"
import { DeviceSettingsForm } from "./device-settings-form"

interface SettingPageProps {
    params: Promise<{
        code: string;
        assetId: string;
    }>
}

export async function TenantsManagementidAssetsassetIdSettingsClient({ params }: SettingPageProps) {
    const { code: tenantId, assetId } = await params;

    const asset = await getAsset(tenantId, assetId)

    if (!asset) {
        return notFound()
    }

    return <DeviceSettingsForm asset={asset} tenantId={tenantId} />
}
