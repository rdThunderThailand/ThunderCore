import { AssetWithDevices } from '@/types/asset-management'
import { isDevBypass } from './dev'
import { MOCK_ASSETS_V2 } from './mock/assets-v2'

// Living endpoint catalog for the v2 (asset-centric) model — each signature is the future
// REST contract. Swap the body to axios (core/v1/tenants/:id/assets-v2) when it lands.

export async function getAssetsV2(tenantId: string): Promise<AssetWithDevices[]> {
    if (isDevBypass()) return MOCK_ASSETS_V2.filter((a) => a.tenant_id === tenantId)
    return []
}
