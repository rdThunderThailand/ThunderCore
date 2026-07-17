import { Membership } from '@/types/members'

// ponytail: fixtures for dev bypass — remove when GET core/v1/tenants/:id/members exists.

export const MOCK_MEMBERS: Membership[] = [
    {
        id: 'b1000000-0000-0000-0000-000000000001',
        user_id: 'u1000000-0000-0000-0000-000000000001',
        tenant_id: '00000000-0000-0000-0000-000000000000',
        role: 'owner',
        joined_at: '2026-05-12T04:36:11.567475+00:00',
        user: {
            id: 'u1000000-0000-0000-0000-000000000001',
            email: 'somchai@thunder.co.th',
            full_name: 'Somchai Jaidee',
        },
    },
    {
        id: 'b1000000-0000-0000-0000-000000000002',
        user_id: 'u1000000-0000-0000-0000-000000000002',
        tenant_id: '00000000-0000-0000-0000-000000000000',
        role: 'admin',
        joined_at: '2026-05-20T09:15:00.000000+00:00',
        user: {
            id: 'u1000000-0000-0000-0000-000000000002',
            email: 'nan@thunder.co.th',
            full_name: 'Nan Suksai',
        },
    },
    {
        id: 'b1000000-0000-0000-0000-000000000003',
        user_id: 'u1000000-0000-0000-0000-000000000003',
        tenant_id: '00000000-0000-0000-0000-000000000000',
        role: 'member',
        joined_at: '2026-06-02T13:40:00.000000+00:00',
        user: {
            id: 'u1000000-0000-0000-0000-000000000003',
            email: 'ploy@thunder.co.th',
            full_name: 'Ploy Wattana',
        },
    },
    {
        id: 'b1000000-0000-0000-0000-000000000004',
        user_id: 'u1000000-0000-0000-0000-000000000004',
        tenant_id: 'e316bbcf-2eb6-48ae-b5d9-74d631dec359',
        role: 'owner',
        joined_at: '2026-04-08T07:00:34.824207+00:00',
        user: {
            id: 'u1000000-0000-0000-0000-000000000004',
            email: 'anan@art.example.com',
            full_name: 'Anan Chaiyo',
        },
    },
    {
        id: 'b1000000-0000-0000-0000-000000000005',
        user_id: 'u1000000-0000-0000-0000-000000000005',
        tenant_id: 'e316bbcf-2eb6-48ae-b5d9-74d631dec359',
        role: 'member',
        joined_at: '2026-05-01T10:00:00.000000+00:00',
        user: {
            id: 'u1000000-0000-0000-0000-000000000005',
            email: 'kanya@art.example.com',
            full_name: 'Kanya Rungrueang',
        },
    },
]
