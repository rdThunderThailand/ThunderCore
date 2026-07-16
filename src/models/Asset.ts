export type AssetStatus = 'Active' | 'Maintenance' | 'Retired'

export interface Asset {
    id: string
    tenant_id: string
    name: string
    serial_number: string | null
    mac_address: string | null
    type: string
    status: AssetStatus
    created_at: string
    updated_at: string
}
