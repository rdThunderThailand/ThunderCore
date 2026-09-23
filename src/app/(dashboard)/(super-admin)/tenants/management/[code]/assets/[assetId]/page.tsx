import { TenantsManagementidAssetsassetIdClient } from '@/features/platform-tenants/management/[id]/assets/[assetId]/TenantsManagementidAssetsassetIdClient'

export const dynamic = 'force-dynamic'

export default async function AssetDetailPage(props: any) {
    return <TenantsManagementidAssetsassetIdClient {...props} />
}
