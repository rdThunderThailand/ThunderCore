'use server'

import {
    Asset, AssetFolder, BulkImportResult,
    BulkImportRow, CreateAssetInput, CreateFolderInput, DeviceCredentials,
    TenantQuota, UnregisterAssetInput, UpdateAssetInput
} from "@/types/assets"
import { requireAdmin } from "@/utils/auth-context"
import { getAdminClient } from "@/utils/supabase/admin"

// =====================
// HELPERS
// =====================

function generateMqttClientId(tenantId: string, assetId: string): string {
    const shortOrg = tenantId.split('-')[0]
    const shortAsset = assetId.split('-')[0]
    return `device_${shortOrg}_${shortAsset}_${Date.now().toString(36)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getClient(isSuperAdmin: boolean, supabase: any) {
    return isSuperAdmin ? await getAdminClient() : supabase
}

// =====================
// QUOTA
// =====================

export async function getTenantQuota(tenantId: string): Promise<TenantQuota> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    // Get quota limit
    const { data: org } = await client
        .from('tenants')
        .select('device_quota')
        .eq('id', tenantId)
        .single()

    const total = org?.device_quota ?? 50

    // Count active/pending assets (not unregistered)
    const { count } = await client
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .neq('registry_status', 'unregistered')

    const used = count ?? 0

    return {
        used,
        total,
        remaining: Math.max(0, total - used)
    }
}

// =====================
// GET ASSETS
// =====================

export interface GetAssetsOptions {
    page?: number;
    limit?: number;
    search?: string;
    status?: string | 'all';
    folderId?: string | null | undefined;
    sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
    activeTab?: 'unregister' | 'player';
    tags?: string[];
    v2AssetId?: string | null;
}

export async function getTenantAssets(tenantId: string, options?: GetAssetsOptions): Promise<{ data: Asset[], count: number }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    let query = client.from('assets').select('*', { count: 'exact' }).eq('tenant_id', tenantId)

    if (options?.search) {
        query = query.or(`device_name.ilike.%${options.search}%,name.ilike.%${options.search}%,serial_number.ilike.%${options.search}%,mac_address.ilike.%${options.search}%,model.ilike.%${options.search}%`)
    }

    if (options?.status && options.status !== 'all') {
        if (['online', 'offline', 'busy'].includes(options.status)) {
            query = query.eq('connection_status', options.status)
        } else {
            query = query.eq('registry_status', options.status)
        }
    }

    if (options?.folderId) {
        query = query.eq('folder_id', options.folderId)
    }

    if (options?.activeTab === 'unregister') {
        query = query.in('registry_status', ['pending', 'unregistered'])
    } else if (options?.activeTab === 'player') {
        query = query.eq('registry_status', 'active')
    }

    if (options?.v2AssetId) {
        const { data: links } = await client
            .from('asset_device_links')
            .select('device_id')
            .eq('asset_id', options.v2AssetId)

        const deviceIds = links?.map((l: { device_id: string }) => l.device_id) || []
        if (deviceIds.length > 0) {
            query = query.in('id', deviceIds)
        } else {
            // Force empty if no devices linked
            query = query.eq('id', '00000000-0000-0000-0000-000000000000')
        }
    }

    if (options?.sortBy) {
        switch (options.sortBy) {
            case 'newest': query = query.order('created_at', { ascending: false }); break;
            case 'oldest': query = query.order('created_at', { ascending: true }); break;
            case 'name_asc':
                query = query.order('device_name', { ascending: true, nullsFirst: false });
                query = query.order('name', { ascending: true, nullsFirst: false });
                break;
            case 'name_desc':
                query = query.order('device_name', { ascending: false, nullsFirst: false });
                query = query.order('name', { ascending: false, nullsFirst: false });
                break;
        }
    } else {
        query = query.order('created_at', { ascending: false })
    }

    if (options?.page && options.limit) {
        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        query = query.range(from, to)
    }

    const { data: assets, error, count } = await query

    if (error) {
        console.error('Error fetching assets:', error)
        throw new Error('Failed to fetch assets')
    }

    return { data: assets as Asset[], count: count || 0 }
}

// =====================
// GET FOLDERS
// =====================

export async function getAssetFolders(tenantId: string): Promise<AssetFolder[]> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    const { data: folders, error } = await client
        .from('asset_folders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching asset folders:', error)
        throw new Error('Failed to fetch asset folders')
    }

    return folders as AssetFolder[]
}

// =====================
// BATCH DATA FETCH (PERFORMANCE OPTIMIZATION)
// =====================

/**
 * Fetches assets, quota, and folders in a single server action to reduce
 * overhead from multiple HTTP requests and auth/role verification queries.
 */
export async function getAssetDashboardData(tenantId: string, options?: GetAssetsOptions) {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    // 1. Prepare Quota Promise
    const orgPromise = client.from('tenants').select('device_quota').eq('id', tenantId).single()
    const quotaUsedPromise = client.from('assets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).neq('registry_status', 'unregistered')

    // 2. Prepare Folders Promise
    const foldersPromise = client.from('asset_folders').select('*').eq('tenant_id', tenantId).order('name', { ascending: true })

    // 3. Prepare All Tags Promise (for extracting unique distinct tags)
    const allTagsPromise = client.from('assets').select('tags').eq('tenant_id', tenantId).not('tags', 'is', null)

    // 4. Prepare Assets Promise
    let assetsQuery = client.from('assets').select('*', { count: 'exact' }).eq('tenant_id', tenantId)

    if (options?.search) {
        assetsQuery = assetsQuery.or(`device_name.ilike.%${options.search}%,name.ilike.%${options.search}%,serial_number.ilike.%${options.search}%,mac_address.ilike.%${options.search}%,model.ilike.%${options.search}%`)
    }

    if (options?.status && options.status !== 'all') {
        if (['online', 'offline', 'busy'].includes(options.status)) {
            assetsQuery = assetsQuery.eq('connection_status', options.status)
        } else {
            assetsQuery = assetsQuery.eq('registry_status', options.status)
        }
    }

    if (options?.folderId) {
        assetsQuery = assetsQuery.eq('folder_id', options.folderId)
    }

    if (options?.activeTab === 'unregister') {
        assetsQuery = assetsQuery.in('registry_status', ['pending', 'unregistered'])
    } else if (options?.activeTab === 'player') {
        assetsQuery = assetsQuery.eq('registry_status', 'active')
    }

    if (options?.v2AssetId) {
        const { data: links } = await client
            .from('asset_device_links')
            .select('device_id')
            .eq('asset_id', options.v2AssetId)

        const deviceIds = links?.map((l: { device_id: string }) => l.device_id) || []
        if (deviceIds.length > 0) {
            assetsQuery = assetsQuery.in('id', deviceIds)
        } else {
            // Force empty if no devices linked
            assetsQuery = assetsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
        }
    }

    if (options?.tags && options.tags.length > 0) {
        assetsQuery = assetsQuery.overlaps('tags', options.tags)
    }

    if (options?.sortBy) {
        switch (options.sortBy) {
            case 'newest': assetsQuery = assetsQuery.order('created_at', { ascending: false }); break;
            case 'oldest': assetsQuery = assetsQuery.order('created_at', { ascending: true }); break;
            case 'name_asc':
                assetsQuery = assetsQuery.order('device_name', { ascending: true, nullsFirst: false });
                assetsQuery = assetsQuery.order('name', { ascending: true, nullsFirst: false });
                break;
            case 'name_desc':
                assetsQuery = assetsQuery.order('device_name', { ascending: false, nullsFirst: false });
                assetsQuery = assetsQuery.order('name', { ascending: false, nullsFirst: false });
                break;
        }
    } else {
        assetsQuery = assetsQuery.order('created_at', { ascending: false })
    }

    if (options?.page && options.limit) {
        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        assetsQuery = assetsQuery.range(from, to)
    }

    // Execute all concurrently on the database
    const [orgRes, usedRes, foldersRes, allTagsRes, assetsRes] = await Promise.all([
        orgPromise,
        quotaUsedPromise,
        foldersPromise,
        allTagsPromise,
        assetsQuery
    ])

    // Compile Quota
    const total = orgRes.data?.device_quota ?? 50
    const used = usedRes.count ?? 0
    const quotaData: TenantQuota = { used, total, remaining: Math.max(0, total - used) }

    if (assetsRes.error) {
        console.error('Error fetching dashboard assets:', assetsRes.error)
        throw new Error('Failed to fetch dashboard assets')
    }

    // Extract unique tags
    const allTags = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (allTagsRes.data || []).forEach((row: any) => {
        if (Array.isArray(row.tags)) {
            row.tags.forEach((t: string) => allTags.add(t))
        }
    });

    return {
        assets: { data: assetsRes.data as Asset[], count: assetsRes.count || 0 },
        quota: quotaData,
        folders: (foldersRes.data || []) as AssetFolder[],
        availableTags: Array.from(allTags)
    }
}

// =====================
// CREATE ASSET (with quota + duplicate + credential generation)
// =====================

export async function createAsset(tenantId: string, input: CreateAssetInput): Promise<{ asset: Asset; credentials: DeviceCredentials }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    // 1. Quota Check
    const quota = await getTenantQuota(tenantId)
    if (quota.remaining <= 0) {
        throw new Error(`Device quota reached (${quota.used}/${quota.total}). Please upgrade your plan or unregister unused devices.`)
    }

    // 2. Duplicate Check — Serial Number
    if (input.serial_number?.trim()) {
        const { data: dupSerial } = await client
            .from('assets')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('serial_number', input.serial_number.trim())
            .neq('registry_status', 'unregistered')
            .single()

        if (dupSerial) {
            throw new Error(`An asset with serial number "${input.serial_number}" is already registered in this tenant.`)
        }
    }

    // 3. Duplicate Check — MAC Address
    if (input.mac_address?.trim()) {
        const normalizedMac = input.mac_address.trim().toUpperCase()
        const { data: dupMac } = await client
            .from('assets')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('mac_address', normalizedMac)
            .neq('registry_status', 'unregistered')
            .single()

        if (dupMac) {
            throw new Error(`An asset with MAC address "${input.mac_address}" is already registered in this tenant.`)
        }
    }

    // 4. Insert Asset
    const { data: asset, error: assetError } = await client
        .from('assets')
        .insert({
            tenant_id: tenantId,
            name: input.device_name,
            device_name: input.device_name,
            serial_number: input.serial_number?.trim() || null,
            mac_address: input.mac_address?.trim()?.toUpperCase() || null,
            model: input.model?.trim() || null,
            type: input.device_type,
            device_type: input.device_type,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            folder_id: (input as any).folder_id || null,
            site: input.site?.trim() || null,
            zone: input.zone?.trim() || null,
            status: 'Active',
            registry_status: 'pending',
            data_retention: 'archive'
        })
        .select()
        .single()

    if (assetError || !asset) {
        console.error('Error creating asset:', assetError)
        if (assetError?.code === '23505') {
            throw new Error('Duplicate device detected. A device with this serial number or MAC address already exists.')
        }
        throw new Error('Failed to register asset')
    }

    // 5. Generate Credentials
    const mqttClientId = generateMqttClientId(tenantId, asset.id)

    const { data: credentials, error: credError } = await client
        .from('device_credentials')
        .insert({
            asset_id: asset.id,
            mqtt_client_id: mqttClientId
            // access_token auto-generated by DB default
        })
        .select()
        .single()

    if (credError) {
        console.error('Error generating credentials:', credError)
        // Don't fail the whole operation — asset is created
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return {
        asset: asset as Asset,
        credentials: credentials as DeviceCredentials
    }
}

// =====================
// UPDATE ASSET
// =====================

export async function updateAsset(tenantId: string, assetId: string, input: UpdateAssetInput): Promise<Asset> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}
    if (input.device_name !== undefined) {
        updateData.device_name = input.device_name
        updateData.name = input.device_name
    }
    if (input.serial_number !== undefined) updateData.serial_number = input.serial_number?.trim() || null
    if (input.mac_address !== undefined) updateData.mac_address = input.mac_address?.trim()?.toUpperCase() || null
    if (input.model !== undefined) updateData.model = input.model?.trim() || null
    if (input.device_type !== undefined) {
        updateData.device_type = input.device_type
        updateData.type = input.device_type
    }
    if (input.site !== undefined) updateData.site = input.site?.trim() || null
    if (input.zone !== undefined) updateData.zone = input.zone?.trim() || null
    if (input.app_version !== undefined) updateData.app_version = input.app_version?.trim() || null
    if (input.ip_address !== undefined) updateData.ip_address = input.ip_address?.trim() || null
    if (input.screen_ratio !== undefined) updateData.screen_ratio = input.screen_ratio?.trim() || null
    if (input.screen_dimension !== undefined) updateData.screen_dimension = input.screen_dimension?.trim() || null
    if (input.tags !== undefined) updateData.tags = input.tags || null

    // Setting configuration fields
    if (input.download_mode !== undefined) updateData.download_mode = input.download_mode || null
    if (input.player_log_enable !== undefined) updateData.player_log_enable = input.player_log_enable
    if (input.player_log_days !== undefined) updateData.player_log_days = input.player_log_days
    if (input.transfer_log_enable !== undefined) updateData.transfer_log_enable = input.transfer_log_enable
    if (input.media_log_enable !== undefined) updateData.media_log_enable = input.media_log_enable
    if (input.media_log_days !== undefined) updateData.media_log_days = input.media_log_days
    if (input.media_log_mode !== undefined) updateData.media_log_mode = input.media_log_mode || null
    if (input.capture_screen !== undefined) updateData.capture_screen = input.capture_screen
    if (input.capture_period !== undefined) updateData.capture_period = input.capture_period || null
    if (input.cctv_url !== undefined) updateData.cctv_url = input.cctv_url || null
    if (input.location_url !== undefined) updateData.location_url = input.location_url || null
    if (input.sync_media !== undefined) updateData.sync_media = input.sync_media

    const { data: asset, error } = await client
        .from('assets')
        .update(updateData)
        .eq('id', assetId)
        .eq('tenant_id', tenantId)
        .select()
        .single()

    if (error) {
        console.error('Error updating asset:', error)
        if (error.code === '23505') {
            throw new Error('Duplicate device detected. A device with this serial number or MAC address already exists.')
        }
        throw new Error('Failed to update asset')
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets/${assetId}`)

    return asset as Asset
}

// =====================
// UNREGISTER ASSET (revoke credentials, update status, release quota)
// =====================

export async function unregisterAsset(tenantId: string, input: UnregisterAssetInput): Promise<{ success: boolean }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    // 1. Revoke credentials
    await client
        .from('device_credentials')
        .update({
            is_revoked: true,
            revoked_at: new Date().toISOString()
        })
        .eq('asset_id', input.assetId)

    // 2. Update asset status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
        registry_status: 'unregistered',
        status: 'Retired',
        unregistered_at: new Date().toISOString(),
        data_retention: input.dataRetention
    }

    const { error } = await client
        .from('assets')
        .update(updateData)
        .eq('id', input.assetId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error unregistering asset:', error)
        throw new Error('Failed to unregister asset')
    }

    // 3. If user chose 'delete', remove all associated data
    if (input.dataRetention === 'delete') {
        await client
            .from('assets')
            .delete()
            .eq('id', input.assetId)
            .eq('tenant_id', tenantId)
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return { success: true }
}

// =====================
// DELETE ASSET (hard delete)
// =====================

export async function deleteAsset(tenantId: string, assetId: string): Promise<{ success: boolean }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    const { error } = await client
        .from('assets')
        .delete()
        .eq('id', assetId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error deleting asset:', error)
        throw new Error('Failed to delete asset')
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return { success: true }
}

// =====================
// FOLDER ACTIONS
// =====================

export async function createAssetFolder(tenantId: string, input: CreateFolderInput): Promise<AssetFolder> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    const { data: folder, error } = await client
        .from('asset_folders')
        .insert({
            tenant_id: tenantId,
            name: input.name.trim(),
            parent_id: input.parent_id || null
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating asset folder:', error)
        if (error.code === '23505') {
            throw new Error('A folder with this name already exists at this level.')
        }
        throw new Error('Failed to create folder')
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return folder as AssetFolder
}

export async function renameAssetFolder(tenantId: string, folderId: string, newName: string): Promise<{ success: boolean }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    const { error } = await client
        .from('asset_folders')
        .update({ name: newName.trim() })
        .eq('id', folderId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error renaming asset folder:', error)
        if (error.code === '23505') {
            throw new Error('A folder with this name already exists at this level.')
        }
        throw new Error('Failed to rename folder')
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return { success: true }
}

export async function moveAssetFolder(tenantId: string, folderId: string, newParentId: string | null): Promise<{ success: boolean }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    if (folderId === newParentId) {
        throw new Error('Cannot move a folder into itself.')
    }

    const { error } = await client
        .from('asset_folders')
        .update({ parent_id: newParentId })
        .eq('id', folderId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error moving asset folder:', error)
        throw new Error('Failed to move folder')
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return { success: true }
}

export async function deleteAssetFolder(tenantId: string, folderId: string): Promise<{ success: boolean }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    // Note: Due to ON DELETE SET NULL on the assets table,
    // deleting a folder will automatically move its assets to the "root" (folder_id = null)

    // Check if it has children folders
    // We can allow this because the database schema has:
    // 1. parent_id ON DELETE CASCADE (deletes sub-folders automatically)
    // 2. assets.folder_id ON DELETE SET NULL (moves assets to root)

    const { error } = await client
        .from('asset_folders')
        .delete()
        .eq('id', folderId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error deleting asset folder:', error)
        throw new Error(error.message || 'Failed to delete folder')
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return { success: true }
}

export async function moveAssetToFolder(tenantId: string, assetId: string, folderId: string | null): Promise<{ success: boolean }> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    const { error } = await client
        .from('assets')
        .update({ folder_id: folderId })
        .eq('id', assetId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error moving asset:', error)
        throw new Error('Failed to move asset')
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/assets`)

    return { success: true }
}

// =====================
// GET CREDENTIALS
// =====================

export async function getAssetCredentials(tenantId: string, assetId: string): Promise<DeviceCredentials | null> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    const client = await getClient(isSuperAdmin, supabase)

    // Verify asset belongs to this org
    const { data: asset } = await client
        .from('assets')
        .select('id')
        .eq('id', assetId)
        .eq('tenant_id', tenantId)
        .single()

    if (!asset) {
        throw new Error('Asset not found in this tenant')
    }

    const { data: credentials } = await client
        .from('device_credentials')
        .select('*')
        .eq('asset_id', assetId)
        .single()

    return credentials as DeviceCredentials | null
}

// =====================
// BULK IMPORT
// =====================

export async function bulkImportAssets(tenantId: string, csvContent: string): Promise<BulkImportResult> {
    const { supabase, isSuperAdmin } = await requireAdmin()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const client = await getClient(isSuperAdmin, supabase)

    // Parse CSV
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

    // Check quota for all rows
    const quota = await getTenantQuota(tenantId)
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

        // Validate required fields
        if (!row.device_name || !row.device_type) {
            rowResult.status = 'error'
            rowResult.message = 'Missing required field: device_name or device_type'
            failedCount++
            results.push(rowResult)
            continue
        }

        try {
            await createAsset(tenantId, {
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

    return {
        total: dataRows.length,
        success: successCount,
        failed: failedCount,
        rows: results
    }
}

// =====================
// BULK UNREGISTER
// =====================

export async function bulkUnregisterAssets(
    tenantId: string,
    assetIds: string[],
    dataRetention: 'archive' | 'delete'
): Promise<{ success: number; failed: number }> {
    let success = 0
    let failed = 0

    for (const assetId of assetIds) {
        try {
            await unregisterAsset(tenantId, { assetId, dataRetention })
            success++
        } catch {
            failed++
        }
    }

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
