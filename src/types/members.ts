export type TenantRole = 'Executive Viewer' | 'Department Admin' | 'Company Admin' | 'Operator' | 'Auditor';
export type MemberRole = TenantRole | 'Admin' | 'Member' | 'Owner';
export type MemberStatus = 'Active' | 'Inactive' | 'Invited';

export interface OrgMember {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    status: MemberStatus;
    joined_at: string;
    avatar_url?: string;
}

export interface Membership {
    id: string;
    user_id: string;
    tenant_id: string;
    role: TenantRole | 'owner' | 'admin' | 'member';
    joined_at: string;
    user?: {
        id: string;
        email: string;
        full_name: string;
        avatar_url?: string;
    };
}

export interface GetMembersOptions {
    page?: number;
    limit?: number;
    search?: string;
}

export interface MemberDetails extends Membership {
    profiles: {
        first_name: string;
        last_name: string;
        email: string;
    };
}
