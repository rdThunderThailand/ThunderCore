export type MemberRole = 'Admin' | 'Member' | 'Owner';
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
    role: 'owner' | 'admin' | 'member';
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
