import { AssetActivityLog } from '@/types/asset-management'

// ponytail: fixtures for dev bypass — remove when GET core/v1/assets/:id/activity exists.

export const MOCK_ASSET_ACTIVITY_LOGS: AssetActivityLog[] = [
    {
        id: 'a2000000-0000-0000-0000-000000000001',
        asset_id: 'd1000000-0000-0000-0000-000000000001',
        activity_type: 'DEVICE_LINK',
        description: 'Device ART-DEV-0001 linked to this asset',
        occurred_at: '2026-04-15T04:30:00.000Z',
        performed_by_id: null,
        metadata: {},
        performed_by_name: 'ART Field Ops',
    },
    {
        id: 'a2000000-0000-0000-0000-000000000002',
        asset_id: 'd1000000-0000-0000-0000-000000000001',
        activity_type: 'STATUS_CHANGE',
        description: 'Asset marked Active after installation check',
        occurred_at: '2026-04-16T09:00:00.000Z',
        performed_by_id: null,
        metadata: { reason: 'Post-install verification passed' },
        performed_by_name: 'ART Field Ops',
    },
    {
        id: 'a2000000-0000-0000-0000-000000000003',
        asset_id: 'd1000000-0000-0000-0000-000000000004',
        activity_type: 'DEVICE_LINK',
        description: 'Device BEN-DEV-0001 linked to this asset',
        occurred_at: '2026-05-18T04:30:00.000Z',
        performed_by_id: null,
        metadata: {},
        performed_by_name: 'Facilities',
    },
    {
        id: 'a2000000-0000-0000-0000-000000000004',
        asset_id: 'd1000000-0000-0000-0000-000000000005',
        activity_type: 'STATUS_CHANGE',
        description: 'Asset unregistered and archived',
        occurred_at: '2026-06-30T04:00:00.000Z',
        performed_by_id: null,
        metadata: { reason: 'Kiosk decommissioned' },
        performed_by_name: 'Facilities',
    },
]
