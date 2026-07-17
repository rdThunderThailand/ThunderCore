import { SystemApplication } from '@/models/Application'

// ponytail: fixtures for dev bypass — remove when GET core/v1/applications exists.

export const MOCK_APPLICATIONS: SystemApplication[] = [
    {
        id: 'a1000000-0000-0000-0000-000000000001',
        name: 'Cityzen Portal',
        description: 'Citizen-facing app',
        tenant_id: '00000000-0000-0000-0000-000000000000',
        tenant_name: 'Executive BEN Tenant',
        status: 'active',
        environment: 'production',
        url: 'https://cityzen.example.com',
        created_at: '2026-06-01T04:00:00.000Z',
        updated_at: '2026-06-01T04:00:00.000Z',
    },
    {
        id: 'a1000000-0000-0000-0000-000000000002',
        name: 'Asset Monitor',
        tenant_id: 'e316bbcf-2eb6-48ae-b5d9-74d631dec359',
        tenant_name: 'ART',
        status: 'maintenance',
        environment: 'staging',
        created_at: '2026-07-10T08:30:00.000Z',
        updated_at: '2026-07-12T08:30:00.000Z',
    },
    {
        id: 'a1000000-0000-0000-0000-000000000003',
        name: 'SAI Console',
        tenant_id: '',
        status: 'inactive',
        environment: 'development',
        is_shared: true,
        created_at: '2026-07-16T02:00:00.000Z',
        updated_at: '2026-07-16T02:00:00.000Z',
    },
]
