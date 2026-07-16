import { TenantsManagementidAssetsassetIdSettingsClient } from '@/features/platform-tenants/management/[id]/assets/[assetId]/settings/TenantsManagementidAssetsassetIdSettingsClient'

export const dynamic = 'force-dynamic'

export default async function AssetSettingsPage(props: any) {
    return <TenantsManagementidAssetsassetIdSettingsClient {...props} />
}
