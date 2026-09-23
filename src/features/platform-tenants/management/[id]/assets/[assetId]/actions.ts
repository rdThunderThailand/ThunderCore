'use server'

import * as assets from '@/lib/assets'

// Server Action boundary for the single-asset detail surface — delegates to the src/lib seam.

export async function getAssetActivityLogs(assetId: string) {
    return assets.getAssetActivityLogs(assetId)
}

export async function getAssetDevices(assetId: string) {
    return assets.getLinkedDevices(assetId)
}
