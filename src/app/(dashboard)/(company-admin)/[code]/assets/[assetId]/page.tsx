import { TenantsManagementidAssetsassetIdClient } from '@/features/platform-tenants/management/[id]/assets/[assetId]/TenantsManagementidAssetsassetIdClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminAssetDetailPage(props: { params: Promise<{ code: string, assetId: string }> }) {
    const { code } = await props.params
    return <TenantsManagementidAssetsassetIdClient {...props} basePath={`/${code}`} />
}
