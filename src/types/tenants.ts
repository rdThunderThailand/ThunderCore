export type TenantType = 'enterprise' | 'business' | 'startup' | 'government' | 'non_profit' | 'municipal';
export type TenantStatus = 'active' | 'suspended' | 'archived';

export interface Tenant {
    id: string;
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
