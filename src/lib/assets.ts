import {
    Asset, AssetFolder, CreateAssetInput, CreateFolderInput,
    DeviceCredentials, TenantQuota, UnregisterAssetInput, UpdateAssetInput
} from '@/types/assets'
import { AssetActivityLog, Device } from '@/types/asset-management'
import { isDevBypass } from './dev'
import { MOCK_ASSET_ACTIVITY_LOGS } from './mock/asset-activity'
import { MOCK_ASSETS, MOCK_ASSET_FOLDERS, MOCK_DEVICE_CREDENTIALS } from './mock/assets'
import { MOCK_ASSETS_V2 } from './mock/assets-v2'
import { MOCK_DEVICES } from './mock/devices'
import { MOCK_TENANTS } from './mock/tenants'
import { thunderCore } from './thunder-core'

// Living endpoint catalog — each signature is the future REST contract.
// Swap bodies to axios (core/v1/tenants/:id/assets) when the endpoints land; callers don't change.
type ThunderResponse<T> = { success: boolean; data: T }
const noEndpoint = (fn: string): never => {
    throw new Error(`${fn}: no REST endpoint yet — set NEXT_PUBLIC_DEV_BYPASS=true to use mock data`)
}

function generateMqttClientId(tenantId: string, assetId: string): string {
    return `mqtt-${tenantId.slice(0, 8)}-${assetId.slice(0, 8)}`
}

export interface GetAssetsOptions {
    page?: number
    limit?: number
    search?: string
    status?: string | 'all'
    folderId?: string | null
    sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc'
    activeTab?: 'unregister' | 'player'
    tags?: string[]
    v2AssetId?: string | null
}

function matchesFilters(asset: Asset, options?: GetAssetsOptions): boolean {
    if (!options) return true

    if (options.search) {
        const term = options.search.toLowerCase()
        const haystack = [asset.device_name, asset.name, asset.serial_number, asset.mac_address, asset.model]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
        if (!haystack.includes(term)) return false
    }

    if (options.status && options.status !== 'all') {
        if (['online', 'offline', 'busy'].includes(options.status)) {
            if (asset.connection_status !== options.status) return false
        } else if (asset.registry_status !== options.status) {
            return false
        }
    }

    if (options.folderId) {
        if (asset.folder_id !== options.folderId) return false
    }

    if (options.activeTab === 'unregister') {
        if (!['pending', 'unregistered'].includes(asset.registry_status)) return false
    } else if (options.activeTab === 'player') {
        if (asset.registry_status !== 'active') return false
    }

    if (options.tags && options.tags.length > 0) {
        if (!asset.tags?.some((t) => options.tags!.includes(t))) return false
    }

    if (options.v2AssetId) {
        const v2Asset = MOCK_ASSETS_V2.find((a) => a.asset_id === options.v2AssetId)
        if (!v2Asset?.device_ids?.includes(asset.id)) return false
    }

    return true
}

function sortAssets(assets: Asset[], sortBy?: GetAssetsOptions['sortBy']): Asset[] {
    const sorted = [...assets]
    switch (sortBy) {
        case 'oldest':
            return sorted.sort((a, b) => a.created_at.localeCompare(b.created_at))
        case 'name_asc':
            return sorted.sort((a, b) => (a.device_name ?? a.name).localeCompare(b.device_name ?? b.name))
        case 'name_desc':
            return sorted.sort((a, b) => (b.device_name ?? b.name).localeCompare(a.device_name ?? a.name))
        case 'newest':
        default:
            return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at))
    }
}

export async function getTenantQuota(tenantId: string): Promise<TenantQuota> {
    if (isDevBypass()) {
        const tenant = MOCK_TENANTS.find((t) => t.id === tenantId)
        const total = tenant?.deviceQuota ?? 50
        const used = MOCK_ASSETS.filter((a) => a.tenant_id === tenantId && a.registry_status !== 'unregistered').length
        return { used, total, remaining: Math.max(0, total - used) }
    }
    try {
        const res = await thunderCore.get<ThunderResponse<TenantQuota>>(`/tenants/${tenantId}/quota`)
        return res.data.data
    } catch {
        return { used: 0, total: 50, remaining: 50 }
    }
}

export async function getTenantAssets(tenantId: string, options?: GetAssetsOptions): Promise<{ data: Asset[]; count: number }> {
    if (isDevBypass()) {
        const filtered = sortAssets(
            MOCK_ASSETS.filter((a) => a.tenant_id === tenantId && matchesFilters(a, options)),
            options?.sortBy
        )
        if (options?.page && options.limit) {
            const from = (options.page - 1) * options.limit
            return { data: filtered.slice(from, from + options.limit), count: filtered.length }
        }
        return { data: filtered, count: filtered.length }
    }
    try {
        const res = await thunderCore.get<ThunderResponse<{ data: Asset[]; count: number }>>(`/assets`, {
            params: { tenantId, ...options }
        })
        console.log('asset', res.data.data)
        return res.data.data
    } catch (error) {
        console.warn(`GET /assets failed for tenant ${tenantId}:`, error)
        return { data: [], count: 0 }
    }
}

export async function getAssetFolders(tenantId: string): Promise<AssetFolder[]> {
    if (isDevBypass()) {
        return MOCK_ASSET_FOLDERS
            .filter((f) => f.tenant_id === tenantId)
            .sort((a, b) => a.name.localeCompare(b.name))
    }
    try {
        const res = await thunderCore.get<ThunderResponse<AssetFolder[]>>(`/tenants/${tenantId}/folders`)
        return res.data.data
    } catch {
        return []
    }
}

export async function getAssetDashboardData(tenantId: string, options?: GetAssetsOptions) {
    if (isDevBypass()) {
        const [assets, quota, folders] = await Promise.all([
            getTenantAssets(tenantId, options),
            getTenantQuota(tenantId),
            getAssetFolders(tenantId),
        ])

        const allTags = new Set<string>()
        MOCK_ASSETS
            .filter((a) => a.tenant_id === tenantId)
            .forEach((a) => a.tags?.forEach((t) => allTags.add(t)))

        return { assets, quota, folders, availableTags: Array.from(allTags) }
    }

    const [assets, quota, folders] = await Promise.all([
        getTenantAssets(tenantId, options),
        getTenantQuota(tenantId),
        getAssetFolders(tenantId),
    ])

    const allTags = new Set<string>()
    if (Array.isArray(assets?.data)) {
        assets.data.forEach((a) => a.tags?.forEach((t) => allTags.add(t)))
    }

    return { assets, quota, folders, availableTags: Array.from(allTags) }
}

export async function createAsset(tenantId: string, input: CreateAssetInput): Promise<{ asset: Asset; credentials: DeviceCredentials }> {
    if (!isDevBypass()) return noEndpoint('createAsset')

    const quota = await getTenantQuota(tenantId)
    if (quota.remaining <= 0) {
        throw new Error(`Device quota reached (${quota.used}/${quota.total}). Please upgrade your plan or unregister unused devices.`)
    }

    const normalizedSerial = input.serial_number?.trim()
    const normalizedMac = input.mac_address?.trim()?.toUpperCase()

    const tenantAssets = MOCK_ASSETS.filter((a) => a.tenant_id === tenantId && a.registry_status !== 'unregistered')
    if (normalizedSerial && tenantAssets.some((a) => a.serial_number === normalizedSerial)) {
        throw new Error(`An asset with serial number "${input.serial_number}" is already registered in this tenant.`)
    }
    if (normalizedMac && tenantAssets.some((a) => a.mac_address === normalizedMac)) {
        throw new Error(`An asset with MAC address "${input.mac_address}" is already registered in this tenant.`)
    }

    // ponytail: echo a shaped row so the client can render it; real POST returns the server row.
    // Not persisted across requests in bypass mode — the client holds it in local state.
    const now = new Date().toISOString()
    const assetId = crypto.randomUUID()
    const asset: Asset = {
        id: assetId,
        tenant_id: tenantId,
        name: input.device_name,
        device_name: input.device_name,
        serial_number: normalizedSerial || null,
        mac_address: normalizedMac || null,
        model: input.model?.trim() || null,
        type: input.device_type ?? 'Other',
        device_type: input.device_type ?? 'Other',
        folder_id: null,
        site: input.site?.trim() || null,
        zone: input.zone?.trim() || null,
        status: 'Active',
        registry_status: 'pending',
        connection_status: 'offline',
        unregistered_at: null,
        data_retention: 'archive',
        created_at: now,
        updated_at: now,
        last_heartbeat_at: null,
        last_active_user_id: null,
        app_version: input.app_version?.trim() || null,
        ip_address: input.ip_address?.trim() || null,
        screen_ratio: input.screen_ratio?.trim() || null,
        screen_dimension: input.screen_dimension?.trim() || null,
        tags: input.tags || null,
        download_mode: input.download_mode || null,
        player_log_enable: input.player_log_enable ?? false,
        player_log_days: input.player_log_days ?? 7,
        transfer_log_enable: input.transfer_log_enable ?? false,
        media_log_enable: input.media_log_enable ?? false,
        media_log_days: input.media_log_days ?? 7,
        media_log_mode: input.media_log_mode || null,
        capture_screen: input.capture_screen ?? false,
        capture_period: input.capture_period || null,
        cctv_url: input.cctv_url || null,
        location_url: input.location_url || null,
        sync_media: input.sync_media ?? false,
        image_url: input.image_url?.trim() || null,
    }

    const credentials: DeviceCredentials = {
        id: crypto.randomUUID(),
        asset_id: assetId,
        access_token: crypto.randomUUID(),
        mqtt_client_id: generateMqttClientId(tenantId, assetId),
        is_revoked: false,
        created_at: now,
        revoked_at: null,
    }

    return { asset, credentials }
}

export async function updateAsset(tenantId: string, assetId: string, input: UpdateAssetInput): Promise<Asset> {
    if (!isDevBypass()) return noEndpoint('updateAsset')
    const base = MOCK_ASSETS.find((a) => a.id === assetId && a.tenant_id === tenantId) ?? MOCK_ASSETS[0]
    return {
        ...base,
        ...input,
        mac_address: input.mac_address !== undefined ? input.mac_address.trim().toUpperCase() : base.mac_address,
        name: input.device_name ?? base.name,
        type: input.device_type ?? base.type,
        id: assetId,
        tenant_id: tenantId,
        updated_at: new Date().toISOString(),
    }
}

export async function unregisterAsset(_tenantId: string, _input: UnregisterAssetInput): Promise<{ success: boolean }> {
    if (!isDevBypass()) return noEndpoint('unregisterAsset')
    // ponytail: no-op in bypass; client updates local state.
    return { success: true }
}

export async function deleteAsset(_tenantId: string, _assetId: string): Promise<{ success: boolean }> {
    if (!isDevBypass()) return noEndpoint('deleteAsset')
    // ponytail: no-op in bypass; client drops it from local state.
    return { success: true }
}

export async function createAssetFolder(tenantId: string, input: CreateFolderInput): Promise<AssetFolder> {
    if (!isDevBypass()) return noEndpoint('createAssetFolder')
    const now = new Date().toISOString()
    return {
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        name: input.name.trim(),
        parent_id: input.parent_id || null,
        created_at: now,
        updated_at: now,
    }
}

export async function renameAssetFolder(_tenantId: string, _folderId: string, _newName: string): Promise<{ success: boolean }> {
    if (!isDevBypass()) return noEndpoint('renameAssetFolder')
    return { success: true }
}

export async function moveAssetFolder(_tenantId: string, folderId: string, newParentId: string | null): Promise<{ success: boolean }> {
    if (!isDevBypass()) return noEndpoint('moveAssetFolder')
    if (folderId === newParentId) {
        throw new Error('Cannot move a folder into itself.')
    }
    return { success: true }
}

export async function deleteAssetFolder(_tenantId: string, _folderId: string): Promise<{ success: boolean }> {
    if (!isDevBypass()) return noEndpoint('deleteAssetFolder')
    return { success: true }
}

export async function moveAssetToFolder(_tenantId: string, _assetId: string, _folderId: string | null): Promise<{ success: boolean }> {
    if (!isDevBypass()) return noEndpoint('moveAssetToFolder')
    return { success: true }
}

export async function getAssetCredentials(tenantId: string, assetId: string): Promise<DeviceCredentials | null> {
    if (isDevBypass()) {
        const asset = MOCK_ASSETS.find((a) => a.id === assetId && a.tenant_id === tenantId)
        if (!asset) throw new Error('Asset not found in this tenant')
        return MOCK_DEVICE_CREDENTIALS.find((c) => c.asset_id === assetId) ?? null
    }
    return noEndpoint('getAssetCredentials')
}

export async function getLinkedDevices(assetId: string): Promise<Device[]> {
    if (isDevBypass()) {
        return MOCK_DEVICES
            .filter((d) => d.current_asset_id === assetId)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
    }
    return noEndpoint('getLinkedDevices')
}

export async function getAsset(tenantId: string, assetId: string): Promise<Asset | null> {
    if (isDevBypass()) {
        return MOCK_ASSETS.find((a) => a.id === assetId && a.tenant_id === tenantId) ?? null
    }
    return noEndpoint('getAsset')
}

export async function getAssetActivityLogs(assetId: string): Promise<AssetActivityLog[]> {
    if (isDevBypass()) {
        return MOCK_ASSET_ACTIVITY_LOGS
            .filter((log) => log.asset_id === assetId)
            .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    }
    return noEndpoint('getAssetActivityLogs')
}

export async function getDeviceById(tenantId: string, deviceId: string): Promise<Device | null> {
    if (isDevBypass()) {
        return MOCK_DEVICES.find((d) => d.id === deviceId && d.tenant_id === tenantId) ?? null
    }
    return noEndpoint('getDeviceById')
}

export interface UpdateDeviceInput {
    mac_address?: string
    screen_ratio?: string
    screen_dimension?: string
    app_version?: string
    ip_address?: string
}

export async function updateDevice(_tenantId: string, _deviceId: string, _data: UpdateDeviceInput): Promise<{ success: boolean }> {
    if (!isDevBypass()) return noEndpoint('updateDevice')
    // ponytail: no-op in bypass; client holds the update in local state via router.refresh().
    return { success: true }
}
