
import { mockUser } from '@/store/useAuthStore'
import { TenantsClient } from './tenants-client'
import { Tenant } from '@/types/tenants'

const mocktenants: Tenant[] = [
    {
        appCount: 1,
        createdAt: "2026-04-08T07:00:34.824207+00:00",
        deviceCount: 0,
        deviceQuota: 50,
        id: "e316bbcf-2eb6-48ae-b5d9-74d631dec359",
        memberCount: 0,
        name: "ART",
        status: "active",
        type: "enterprise",
    },
    {
        appCount: 2,
        createdAt: "2026-05-12T04:36:11.567475+00:00",
        deviceCount: 0,
        deviceQuota: 50,
        id: "00000000-0000-0000-0000-000000000000",
        memberCount: 4,
        name: "Executive BEN Tenant",
        status: "active",
        type: "enterprise",
    },
    {
        appCount: 0,
        createdAt: "2026-07-16T06:23:32.172365+00:00",
        deviceCount: 0,
        deviceQuota: 50,
        id: "28de0dae-568b-433f-b3f6-858caf5e371c",
        memberCount: 0,
        name: "Peach",
        status: "active",
        type: "enterprise",
    }
]

const mockUsageStats = [
    {
        activeTenants: 4,
        totalApps: 4,
        totalMembers: 16,
        totalTenants: 4,
        tenants: [
            {
                appCount: 1,
                createdAt: "2026-04-08T07:00:34.824207+00:00",
                deviceCount: 0,
                deviceQuota: 50,
                id: "e316bbcf-2eb6-48ae-b5d9-74d631dec359",
                memberCount: 0,
                name: "AIS",
                status: "active",
                type: "enterprise",
            },
            {
                appCount: 2,
                createdAt: "2026-05-12T04:36:11.567475+00:00",
                deviceCount: 0,
                deviceQuota: 50,
                id: "00000000-0000-0000-0000-000000000000",
                memberCount: 4,
                name: "Executive Demo Tenant",
                status: "active",
                type: "enterprise",
            },
            {
                appCount: 0,
                createdAt: "2026-07-16T06:23:32.172365+00:00",
                deviceCount: 0,
                deviceQuota: 50,
                id: "28de0dae-568b-433f-b3f6-858caf5e371c",
                memberCount: 0,
                name: "Peach",
                status: "active",
                type: "enterprise",
            }
        ]
    }
]


export async function TenantsHomeClient() {
    return <TenantsClient initialTenants={mocktenants} userRole={mockUser.role} usageStats={mockUsageStats[0]} />
}