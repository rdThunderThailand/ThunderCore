import { MemberAppAccessRow } from '@/types/applications'

// ponytail: fixtures for dev bypass — remove when GET/POST/DELETE core/v1/applications/:id/members exist.
// Models the real member_app_access table (membership_id + application_id join), not a tenant-overlap guess.

export const MOCK_APPLICATION_MEMBERS: MemberAppAccessRow[] = [
    { id: 'c1000000-0000-0000-0000-000000000001', membership_id: 'b1000000-0000-0000-0000-000000000001', application_id: 'a1000000-0000-0000-0000-000000000001', role: 'owner', is_active: true, created_at: '2026-06-01T04:00:00.000Z' },
    { id: 'c1000000-0000-0000-0000-000000000002', membership_id: 'b1000000-0000-0000-0000-000000000002', application_id: 'a1000000-0000-0000-0000-000000000001', role: 'admin', is_active: true, created_at: '2026-06-02T04:00:00.000Z' },
    { id: 'c1000000-0000-0000-0000-000000000003', membership_id: 'b1000000-0000-0000-0000-000000000003', application_id: 'a1000000-0000-0000-0000-000000000001', role: 'user', is_active: true, created_at: '2026-06-03T04:00:00.000Z' },
    { id: 'c1000000-0000-0000-0000-000000000004', membership_id: 'b1000000-0000-0000-0000-000000000001', application_id: 'a1000000-0000-0000-0000-000000000004', role: 'admin', is_active: true, created_at: '2026-06-16T09:00:00.000Z' },
    { id: 'c1000000-0000-0000-0000-000000000005', membership_id: 'b1000000-0000-0000-0000-000000000002', application_id: 'a1000000-0000-0000-0000-000000000004', role: 'user', is_active: false, created_at: '2026-06-17T09:00:00.000Z' },
    { id: 'c1000000-0000-0000-0000-000000000006', membership_id: 'b1000000-0000-0000-0000-000000000004', application_id: 'a1000000-0000-0000-0000-000000000002', role: 'owner', is_active: true, created_at: '2026-07-11T08:30:00.000Z' },
    { id: 'c1000000-0000-0000-0000-000000000007', membership_id: 'b1000000-0000-0000-0000-000000000005', application_id: 'a1000000-0000-0000-0000-000000000002', role: 'user', is_active: true, created_at: '2026-07-12T08:30:00.000Z' },
    { id: 'c1000000-0000-0000-0000-000000000008', membership_id: 'b1000000-0000-0000-0000-000000000004', application_id: 'a1000000-0000-0000-0000-000000000006', role: 'admin', is_active: true, created_at: '2026-07-02T06:00:00.000Z' },
]
