import { TenantsManagementidAssetsassetIdDevicesdeviceIdClient } from '@/features/platform-tenants/management/[id]/assets/[assetId]/devices/[deviceId]/TenantsManagementidAssetsassetIdDevicesdeviceIdClient'

export const dynamic = 'force-dynamic'

export default async function CompanyAdminDeviceConfigPage(props: { params: Promise<{ id: string, assetId: string, deviceId: string }> }) {
    const { id } = await props.params
    return <TenantsManagementidAssetsassetIdDevicesdeviceIdClient {...props} basePath={`/${id}`} />
}
