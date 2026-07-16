// =====================
// Asset Registry Types
// =====================

export type AssetStatus = 'Active' | 'Maintenance' | 'Retired';
export type AssetRegistryStatus = 'pending' | 'active' | 'unregistered';
export type DataRetentionPolicy = 'archive' | 'delete';

export interface Asset {
    id: string;
    tenant_id: string;
    name: string;
    device_name: string | null;
    serial_number: string | null;
    mac_address: string | null;
    model: string | null;
    type: string;
    device_type: string | null;
    folder_id: string | null;
    site: string | null;
    zone: string | null;
    status: AssetStatus;
    registry_status: AssetRegistryStatus;
    connection_status: 'online' | 'offline' | 'busy';
    unregistered_at: string | null;
    data_retention: DataRetentionPolicy;
    created_at: string;
    updated_at: string;
    last_heartbeat_at: string | null;
    last_active_user_id: string | null;
    app_version: string | null;
    ip_address: string | null;
    screen_ratio: string | null;
    screen_dimension: string | null;
    tags: string[] | null;

    // Config Settings
    download_mode: string | null;
    player_log_enable: boolean;
    player_log_days: number;
    transfer_log_enable: boolean;
    media_log_enable: boolean;
    media_log_days: number;
    media_log_mode: string | null;
    capture_screen: boolean;
    capture_period: string | null;
    cctv_url: string | null;
    location_url: string | null;
    sync_media: boolean;
}

export interface DeviceCredentials {
    id: string;
    asset_id: string;
    access_token: string;
    mqtt_client_id: string;
    is_revoked: boolean;
    created_at: string;
    revoked_at: string | null;
}

export interface CreateAssetInput {
    device_name: string;
    serial_number?: string;
    mac_address?: string;
    model?: string;
    device_type: string;
    site?: string;
    zone?: string;
    app_version?: string;
    ip_address?: string;
    screen_ratio?: string;
    screen_dimension?: string;
    tags?: string[];

    // Config Settings
    download_mode?: string;
    player_log_enable?: boolean;
    player_log_days?: number;
    transfer_log_enable?: boolean;
    media_log_enable?: boolean;
    media_log_days?: number;
    media_log_mode?: string;
    capture_screen?: boolean;
    capture_period?: string;
    cctv_url?: string;
    location_url?: string;
    sync_media?: boolean;
}

export interface UpdateAssetInput {
    device_name?: string;
    serial_number?: string;
    mac_address?: string;
    model?: string;
    device_type?: string;
    site?: string;
    zone?: string;
    app_version?: string;
    ip_address?: string;
    screen_ratio?: string;
    screen_dimension?: string;
    tags?: string[];

    // Config Settings
    download_mode?: string | null;
    player_log_enable?: boolean;
    player_log_days?: number;
    transfer_log_enable?: boolean;
    media_log_enable?: boolean;
    media_log_days?: number;
    media_log_mode?: string | null;
    capture_screen?: boolean;
    capture_period?: string | null;
    cctv_url?: string | null;
    location_url?: string | null;
    sync_media?: boolean;
}

export interface UnregisterAssetInput {
    assetId: string;
    dataRetention: DataRetentionPolicy;
}

export interface TenantQuota {
    used: number;
    total: number;
    remaining: number;
}

export interface BulkImportRow {
    row: number;
    device_name: string;
    serial_number?: string;
    mac_address?: string;
    model?: string;
    device_type: string;
    site?: string;
    zone?: string;
    status: 'success' | 'error';
    message?: string;
}

export interface BulkImportResult {
    total: number;
    success: number;
    failed: number;
    rows: BulkImportRow[];
}

export interface AssetFolder {
    id: string;
    tenant_id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateFolderInput {
    name: string;
    parent_id?: string | null;
}

// Device type options for the UI
export const DEVICE_TYPES = [
    'Sensor',
    'Gateway',
    'Controller',
    'Actuator',
    'Camera',
    'Display',
    'Router',
    'Switch',
    'PLC',
    'HMI',
    'Other'
] as const;
