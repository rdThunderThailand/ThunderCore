export type TenantRole = 'Super Admin' | 'Company Admin' | 'Department Admin' | 'Operator' | 'Auditor';
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
    // A raw roles.code (e.g. 'admin_company', 'operator_technician') — the backend never
    // returns a translated label, so this is always the real per-tenant role code.
    role: string;
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

// POST /tenants/:id/members's fallback outcome when the email has no Thunder Core account yet —
// a pending row in user_invitations, not a membership (no user_id exists to attach one to until
// the invite is accepted).
export interface PendingInvite {
    invitation_id: string;
    email: string;
    status: 'invited';
    role_code: string;
    role_type: string;
    expires_at: string;
    invite_url: string;
}

export type AddMembershipResult = Membership | PendingInvite;

export function isPendingInvite(result: AddMembershipResult): result is PendingInvite {
    return 'invitation_id' in result;
}
