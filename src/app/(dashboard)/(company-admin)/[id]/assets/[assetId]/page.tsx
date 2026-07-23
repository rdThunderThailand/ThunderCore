import { TenantsManagementidAssetsassetIdClient } from '@/features/platform-tenants/management/[id]/assets/[assetId]/TenantsManagementidAssetsassetIdClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminAssetDetailPage(props: { params: Promise<{ id: string, assetId: string }> }) {
    const { id } = await props.params
    return <TenantsManagementidAssetsassetIdClient {...props} basePath={`/${id}`} />
}
