'use server'

import { revalidatePath } from 'next/cache'
import * as assets from '@/lib/assets'
import type { GetAssetsOptions } from '@/lib/assets'
import {
    BulkImportResult, BulkImportRow, CreateAssetInput, CreateFolderInput,
    UnregisterAssetInput, UpdateAssetInput
} from '@/types/assets'

// Server Action boundary for the tenant assets surface — delegates to the src/lib seam.

export async function getTenantQuota(tenantId: string) {
    return assets.getTenantQuota(tenantId)
}

export async function getTenantAssets(tenantId: string, options?: GetAssetsOptions) {
    return assets.getTenantAssets(tenantId, options)
}

export async function getAssetFolders(tenantId: string) {
    return assets.getAssetFolders(tenantId)
}

export async function getAssetDashboardData(tenantId: string, options?: GetAssetsOptions) {
    return assets.getAssetDashboardData(tenantId, options)
}

export async function getAsset(tenantId: string, assetId: string) {
    return assets.getAsset(tenantId, assetId)
}

export async function createAsset(tenantId: string, input: CreateAssetInput) {
    const result = await assets.createAsset(tenantId, input)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function updateAsset(tenantId: string, assetId: string, input: UpdateAssetInput) {
    const result = await assets.updateAsset(tenantId, assetId, input)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets/${assetId}`)
    return result
}

export async function unregisterAsset(tenantId: string, input: UnregisterAssetInput) {
    const result = await assets.unregisterAsset(tenantId, input)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function deleteAsset(tenantId: string, assetId: string) {
    const result = await assets.deleteAsset(tenantId, assetId)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function createAssetFolder(tenantId: string, input: CreateFolderInput) {
    const result = await assets.createAssetFolder(tenantId, input)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function renameAssetFolder(tenantId: string, folderId: string, newName: string) {
    const result = await assets.renameAssetFolder(tenantId, folderId, newName)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function moveAssetFolder(tenantId: string, folderId: string, newParentId: string | null) {
    const result = await assets.moveAssetFolder(tenantId, folderId, newParentId)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function deleteAssetFolder(tenantId: string, folderId: string) {
    const result = await assets.deleteAssetFolder(tenantId, folderId)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function moveAssetToFolder(tenantId: string, assetId: string, folderId: string | null) {
    const result = await assets.moveAssetToFolder(tenantId, assetId, folderId)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    return result
}

export async function getAssetCredentials(tenantId: string, assetId: string) {
    return assets.getAssetCredentials(tenantId, assetId)
}

export async function getLinkedDevices(assetId: string) {
    return assets.getLinkedDevices(assetId)
}

// =====================
// BULK IMPORT (orchestrates createAsset/getTenantQuota — no direct data access of its own)
// =====================

export async function bulkImportAssets(tenantId: string, csvContent: string): Promise<BulkImportResult> {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
        throw new Error('CSV must contain a header row and at least one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    const requiredHeaders = ['device_name', 'device_type']
    for (const req of requiredHeaders) {
        if (!headers.includes(req)) {
            throw new Error(`CSV missing required column: ${req}`)
        }
    }

    const quota = await assets.getTenantQuota(tenantId)
    const dataRows = lines.slice(1).filter(line => line.trim())
    if (dataRows.length > quota.remaining) {
        throw new Error(`Cannot import ${dataRows.length} devices. Only ${quota.remaining} slots remaining (${quota.used}/${quota.total} used).`)
    }

    const results: BulkImportRow[] = []
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < dataRows.length; i++) {
        const values = parseCSVLine(dataRows[i])
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
            row[h] = values[idx]?.trim() || ''
        })

        const rowResult: BulkImportRow = {
            row: i + 2, // 1-indexed, skip header
            device_name: row.device_name || '',
            serial_number: row.serial_number,
            mac_address: row.mac_address,
            model: row.model,
            device_type: row.device_type || '',
            site: row.site,
            zone: row.zone,
            status: 'success',
        }

        if (!row.device_name || !row.device_type) {
            rowResult.status = 'error'
            rowResult.message = 'Missing required field: device_name or device_type'
            failedCount++
            results.push(rowResult)
            continue
        }

        try {
            await assets.createAsset(tenantId, {
                device_name: row.device_name,
                serial_number: row.serial_number || undefined,
                mac_address: row.mac_address || undefined,
                model: row.model || undefined,
                device_type: row.device_type,
                site: row.site || undefined,
                zone: row.zone || undefined
            })
            successCount++
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            rowResult.status = 'error'
            rowResult.message = error.message || 'Unknown error'
            failedCount++
        }

        results.push(rowResult)
    }

    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return {
        total: dataRows.length,
        success: successCount,
        failed: failedCount,
        rows: results
    }
}

export async function bulkUnregisterAssets(
    tenantId: string,
    assetIds: string[],
    dataRetention: 'archive' | 'delete'
): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const assetId of assetIds) {
        try {
            await assets.unregisterAsset(tenantId, { assetId, dataRetention })
            success++
        } catch {
            failed++
        }
    }

    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return { success, failed }
}

// =====================
// CSV PARSER HELPER
// =====================

function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current)
            current = ''
        } else {
            current += char
        }
    }
    result.push(current)
    return result
}
