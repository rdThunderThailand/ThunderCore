import { Tenant } from '@/types/tenants'

// ponytail: fixtures for dev bypass — remove when GET core/v1/tenants exists.

export const MOCK_TENANTS: Tenant[] = [
    {
        id: 'e316bbcf-2eb6-48ae-b5d9-74d631dec359',
        tenantCode: 'ART-001',
        name: 'ART',
        type: 'enterprise',
        status: 'active',
        memberCount: 0,
        appCount: 3,
        deviceQuota: 50,
        deviceCount: 3,
        createdAt: '2026-04-08T07:00:34.824207+00:00',
    },
    {
        id: '00000000-0000-0000-0000-000000000000',
        tenantCode: 'BEN-002',
        name: 'Executive BEN Tenant',
        type: 'enterprise',
        status: 'active',
        memberCount: 4,
        appCount: 3,
        deviceQuota: 50,
        deviceCount: 1,
        createdAt: '2026-05-12T04:36:11.567475+00:00',
    },
    {
        id: '28de0dae-568b-433f-b3f6-858caf5e371c',
        tenantCode: 'PEACH-003',
        name: 'Peach',
        type: 'enterprise',
        status: 'active',
        memberCount: 0,
        appCount: 2,
        deviceQuota: 50,
        deviceCount: 1,
        createdAt: '2026-07-16T06:23:32.172365+00:00',
    },
]

export const MOCK_TENANT_USAGE = {
    activeTenants: 4,
    totalApps: 9,
    totalMembers: 16,
    totalTenants: 4,
    tenants: MOCK_TENANTS,
}
