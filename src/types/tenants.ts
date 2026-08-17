export type TenantType = 'enterprise' | 'business' | 'startup' | 'government' | 'non_profit' | 'municipal';
export type TenantStatus = 'active' | 'suspended' | 'archived';

export interface Tenant {
    id: string;
    tenantCode: string;
    name: string;
    type: TenantType;
    status: TenantStatus;
    memberCount: number;
    appCount: number;
    deviceQuota: number;
    deviceCount: number;
    createdAt: string;
    contactEmail?: string | null;
    websiteUrl?: string | null;
    description?: string | null;
}

export interface TenantDashboardMember {
    id: string;
    role: string;
    created_at: string;
    profile: {
        first_name: string;
        last_name: string;
        avatar_url?: string;
    };
}

export interface TenantDashboardLog {
    id: string;
    created_at: string;
    action: string;
    description: string;
}

export interface TenantDashboardQuota {
    max_assets: number;
    used_assets: number;
    max_storage_mb: number;
    used_storage_mb: number;
}

export interface TenantDashboardPlayerStatus {
    online: number;
    offline: number;
    busy: number;
    error: number;
    total: number;
}

export interface TenantDashboard {
    id: string;
    name: string;
    status: TenantStatus;
    type: TenantType;
    quota: TenantDashboardQuota;
    playerStatus: TenantDashboardPlayerStatus;
    members: TenantDashboardMember[];
    recentLogs: TenantDashboardLog[];
    createdAt: string;
}
