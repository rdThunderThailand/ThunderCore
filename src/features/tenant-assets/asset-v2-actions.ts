'use server'

import * as tenantAssetsV2 from '@/lib/tenant-assets-v2'

// Server Action boundary for the v2 (asset-centric) surface — delegates to the src/lib seam.

export async function getAssetsV2(tenantId: string) {

    return tenantAssetsV2.getAssetsV2(tenantId)
}
