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
    // What Core's member view actually returns for the primary role (role is only set locally
    // after a role change) — read role first, then this.
    role_code?: string;
    // Raw memberships.status from Core: 'invited' | 'active' | 'suspended' | 'removed' | 'archived'.
    // Distinct from the unused MemberStatus above — this is the real value the API returns.
    status?: string;
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

// Agreed with core (thunder_core_API), both branches: email_sent is true once the backend has
// actually emailed the invitee; absent/false → nothing was sent and the frontend must hand out
// invite_url itself. The existing-account branch also carries invite_url/invitation_id now.
export type AddMembershipResult = (Membership | PendingInvite) & {
    email_sent?: boolean;
    invite_url?: string;
};

// Keyed on user_id, not invitation_id: the existing-account branch returns an invitation_id too,
// but only a real membership has a user_id.
export function isPendingInvite(result: AddMembershipResult): result is PendingInvite {
    return !('user_id' in result);
}
