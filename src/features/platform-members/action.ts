'use server'

import { ApplicationDetails } from '@/models/Application'
import { MOCK_APPLICATIONS } from '@/lib/mock/applications'

export interface AppMember {
    id: string
    name: string
    email: string
    role: string
    status: 'Active' | 'Pending'
    tenantName?: string
}

const MOCK_APP_MEMBERS: AppMember[] = [
    {
        id: 'm-1',
        name: 'Somchai Jaidee',
        email: 'somchai@thunder.co.th',
        role: 'Admin',
        status: 'Active',
        tenantName: 'Executive BEN Tenant',
    },
    {
        id: 'm-2',
        name: 'Nan Suksai',
        email: 'nan@thunder.co.th',
        role: 'Developer',
        status: 'Active',
        tenantName: 'Executive BEN Tenant',
    },
    {
        id: 'm-3',
        name: 'Ploy Wattana',
        email: 'ploy@thunder.co.th',
        role: 'Viewer',
        status: 'Pending',
        tenantName: 'Executive BEN Tenant',
    },
]

export async function getApplicationById(appId: string): Promise<ApplicationDetails | null> {
    const mockApp = MOCK_APPLICATIONS.find((a) => a.id === appId)
    if (mockApp) {
        return mockApp
    }

    return {
        id: appId,
        name: 'Thunder Application',
        tenant_id: '00000000-0000-0000-0000-000000000000',
        tenant_name: 'Executive BEN Tenant',
        status: 'active',
        environment: 'production',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}

export async function getApplicationMembers(appId: string): Promise<AppMember[]> {
    return MOCK_APP_MEMBERS
}
