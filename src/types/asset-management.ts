// =====================
// Asset Management Types (v2 - Asset-Centric Model)
// ThunderOS / CityZen Platform
// =====================

// ── Enums ────────────────────────────────────────────────────────────────────

export type AssetLifecycleStatus =
    | 'PLANNED'
    | 'INSTALLING'
    | 'ACTIVE'
    | 'MAINTENANCE'
    | 'SUSPENDED'
    | 'DECOMMISSIONED';

export type AssetTypeCategory =
    | 'DIGITAL_BILLBOARD'
    | 'LED_DISPLAY'
    | 'SMART_POLE'
    | 'KIOSK'
    | 'FLEET_VEHICLE'
    | 'ENVIRONMENTAL_SENSOR'
    | 'CONTROL_CABINET'
    | 'INFRASTRUCTURE_UNIT'
    | 'OTHER';

// ── Site ─────────────────────────────────────────────────────────────────────

export interface Site {
    id: string;
    tenant_id: string;
    name: string;
    code: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface CreateSiteInput {
    name: string;
    code?: string;
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateSiteInput extends Partial<CreateSiteInput> {
    _dummy?: undefined;
}

// ── Business Asset ────────────────────────────────────────────────────────────

export interface AssetV2 {
    id: string;
    tenant_id: string;
    name: string;
    asset_category: AssetTypeCategory;
    lifecycle_status: AssetLifecycleStatus;
    site_id: string | null;
    gps_latitude: number | null;
    gps_longitude: number | null;
    owner_name: string | null;
    maintainer_name: string | null;
    install_date: string | null;
    commissioning_date: string | null;
    description: string | null;
    tags: string[];
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface CreateAssetV2Input {
    name: string;
    asset_category: AssetTypeCategory;
    lifecycle_status?: AssetLifecycleStatus;
    site_id?: string | null;
    gps_latitude?: number;
    gps_longitude?: number;
    owner_name?: string;
    maintainer_name?: string;
    install_date?: string;
    commissioning_date?: string;
    description?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}

export interface UpdateAssetV2Input extends Partial<CreateAssetV2Input> {
    _dummy?: undefined;
}

// ── Asset with enriched site & device info (from v_asset_with_devices view) ──
// NOTE: Column aliases from the view use asset_id / asset_name (not id / name)
export interface AssetWithDevices extends Omit<AssetV2, 'id' | 'name'> {
    asset_id: string;        // aliased from assets.id
    asset_name: string;      // aliased from assets.name
    site_name: string | null;
    province: string | null;
    linked_device_count: number;
    device_ids: string[] | null;
    device_serials: (string | null)[] | null;
}

// ── Physical Device ───────────────────────────────────────────────────────────

export interface Device {
    id: string;
    tenant_id: string;
    serial_number: string | null;
    mac_address: string | null;
    hardware_model: string | null;
    firmware_version: string | null;
    vendor_name: string | null;
    device_type: string | null;
    mqtt_client_id: string | null;
    manufacture_date: string | null;
    purchase_date: string | null;
    warranty_expires: string | null;
    is_active: boolean;
    current_asset_id: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface CreateDeviceInput {
    serial_number?: string;
    mac_address?: string;
    hardware_model?: string;
    firmware_version?: string;
    vendor_name?: string;
    device_type?: string;
    manufacture_date?: string;
    purchase_date?: string;
    warranty_expires?: string;
    metadata?: Record<string, unknown>;
}

export interface UpdateDeviceInput extends Partial<CreateDeviceInput> {
    is_active?: boolean;
}

// ── Asset-Device Link ────────────────────────────────────────────────────────

export interface AssetDeviceLink {
    id: string;
    asset_id: string;
    device_id: string;
    linked_at: string;
    unlinked_at: string | null;
    link_reason: string | null;
    unlink_reason: string | null;
    linked_by_user_id: string | null;
    unlinked_by_user_id: string | null;
    created_at: string;
}

export interface LinkDeviceToAssetInput {
    asset_id: string;
    device_id: string;
    link_reason?: string;
}

export interface UnlinkDeviceFromAssetInput {
    link_id: string;
    unlink_reason?: string;
}

// ── Asset Status History (Audit Log) ─────────────────────────────────────────

export interface AssetStatusHistory {
    id: string;
    asset_id: string;
    from_status: AssetLifecycleStatus | null;
    to_status: AssetLifecycleStatus;
    changed_at: string;
    changed_by_id: string | null;
    reason: string | null;
    metadata: Record<string, unknown>;
}

export interface ChangeAssetStatusInput {
    asset_id: string;
    to_status: AssetLifecycleStatus;
    reason?: string;
}

// ── Constants / Helpers ───────────────────────────────────────────────────────

export const ASSET_LIFECYCLE_STATUSES: AssetLifecycleStatus[] = [
    'PLANNED',
    'INSTALLING',
    'ACTIVE',
    'MAINTENANCE',
    'SUSPENDED',
    'DECOMMISSIONED',
];

export const ASSET_TYPE_CATEGORIES: AssetTypeCategory[] = [
    'DIGITAL_BILLBOARD',
    'LED_DISPLAY',
    'SMART_POLE',
    'KIOSK',
    'FLEET_VEHICLE',
    'ENVIRONMENTAL_SENSOR',
    'CONTROL_CABINET',
    'INFRASTRUCTURE_UNIT',
    'OTHER',
];

export const ASSET_LIFECYCLE_STATUS_LABELS: Record<AssetLifecycleStatus, string> = {
    PLANNED: 'Planned',
    INSTALLING: 'Installing',
    ACTIVE: 'Active',
    MAINTENANCE: 'Maintenance',
    SUSPENDED: 'Suspended',
    DECOMMISSIONED: 'Decommissioned',
};

export const ASSET_CATEGORY_LABELS: Record<AssetTypeCategory, string> = {
    DIGITAL_BILLBOARD: 'Digital Billboard',
    LED_DISPLAY: 'LED Display',
    SMART_POLE: 'Smart Pole',
    KIOSK: 'Kiosk',
    FLEET_VEHICLE: 'Fleet Vehicle',
    ENVIRONMENTAL_SENSOR: 'Environmental Sensor',
    CONTROL_CABINET: 'Control Cabinet',
    INFRASTRUCTURE_UNIT: 'Infrastructure Unit',
    OTHER: 'Other',
};

/** Maps lifecycle status to a UI color class */
export const ASSET_STATUS_COLORS: Record<AssetLifecycleStatus, string> = {
    PLANNED: 'text-blue-400 bg-blue-400/10',
    INSTALLING: 'text-yellow-400 bg-yellow-400/10',
    ACTIVE: 'text-green-400 bg-green-400/10',
    MAINTENANCE: 'text-orange-400 bg-orange-400/10',
    SUSPENDED: 'text-red-400 bg-red-400/10',
    DECOMMISSIONED: 'text-gray-400 bg-gray-400/10',
};
// ── Asset Activity & Attachments — Phase 5 ───────────────────

export interface AssetAttachment {
    id: string
    asset_id: string
    storage_path: string
    file_name: string
    file_type: string | null
    size_bytes: number | null
    created_at: string
    created_by?: string
}

export interface AssetActivityLog {
    id: string
    asset_id: string
    activity_type: 'STATUS_CHANGE' | 'DEVICE_LINK' | 'DEVICE_UNLINK' | 'ATTACHMENT_ADDED'
    description: string
    occurred_at: string
    performed_by_id: string | null
    metadata: Record<string, unknown>
    performed_by_name?: string
}
