// ponytail: fixtures for dev bypass — remove when GET core/v1/tenants/:id/activity (audit_logs) exists.

export interface MockTenantActivityLog {
    id: string
    tenant_id: string
    created_at: string
    action: string
    description: string
}

export const MOCK_TENANT_ACTIVITY: MockTenantActivityLog[] = [
    {
        id: 'g1000000-0000-0000-0000-000000000001',
        tenant_id: '00000000-0000-0000-0000-000000000000',
        created_at: '2026-07-19T09:15:00.000Z',
        action: 'Member invited',
        description: 'nan@thunder.co.th was added as admin',
    },
    {
        id: 'g1000000-0000-0000-0000-000000000002',
        tenant_id: '00000000-0000-0000-0000-000000000000',
        created_at: '2026-07-18T14:30:00.000Z',
        action: 'Asset registered',
        description: 'Env Sensor 01 was added to the tenant',
    },
    {
        id: 'g1000000-0000-0000-0000-000000000003',
        tenant_id: 'e316bbcf-2eb6-48ae-b5d9-74d631dec359',
        created_at: '2026-07-17T08:00:00.000Z',
        action: 'Application updated',
        description: 'Fleet Tracker status changed to active',
    },
]
