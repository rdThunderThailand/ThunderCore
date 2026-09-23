// ponytail: fixtures for dev bypass — remove when GET core/v1/tenants/:id/members/:id/applications exists.

export interface MockMemberApplicationLink {
    member_id: string
    application_id: string
}

export const MOCK_MEMBER_APPLICATIONS: MockMemberApplicationLink[] = [
    { member_id: 'b1000000-0000-0000-0000-000000000001', application_id: 'a1000000-0000-0000-0000-000000000001' },
    { member_id: 'b1000000-0000-0000-0000-000000000001', application_id: 'a1000000-0000-0000-0000-000000000004' },
    { member_id: 'b1000000-0000-0000-0000-000000000002', application_id: 'a1000000-0000-0000-0000-000000000005' },
    { member_id: 'b1000000-0000-0000-0000-000000000004', application_id: 'a1000000-0000-0000-0000-000000000006' },
    { member_id: 'b1000000-0000-0000-0000-000000000005', application_id: 'a1000000-0000-0000-0000-000000000007' },
]
