import { UserPermissions, UserRole } from '@/types';
import { SupabaseClient, User } from '@supabase/supabase-js';

// Legacy role strings (old app_metadata.role / persisted values) → current role_type tiers.
// Protects users whose JWT still carries a pre-migration role until they re-login.
const LEGACY_ROLE_MAP: Record<string, UserRole> = {
    admin_company: 'company_admin',
    executive: 'executive_viewer',
    asset_officer: 'operator',
}

export function normalizeRoleType(role: string): UserRole {
    return (LEGACY_ROLE_MAP[role] ?? role) as UserRole
}

// Keyed by roles.role_type (the tier), NOT roles.code (the persona).
const ROLE_PRIORITY: Record<string, number> = {
    super_admin: 100,
    executive_viewer: 70,
    company_admin: 50,
    viewer_auditor: 20,
    operator: 10,
}

export async function getUserRole(supabase: SupabaseClient, user: User): Promise<UserRole> {
    // Always query DB as source of truth (no app_metadata shortcut)
    try {
        const { data: memberships } = await supabase
            .from('memberships')
            .select(`
                membership_roles (
                    roles ( role_type )
                )
            `)
            .eq('user_id', user.id)

        if (memberships && memberships.length > 0) {
            let highestRole: UserRole = 'operator'
            let highestPriority = 0

            memberships.forEach(m => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mRoles = m.membership_roles as any[]
                mRoles?.forEach(mr => {
                    const roleType = mr.roles?.role_type as string
                    const priority = ROLE_PRIORITY[roleType] || 0
                    if (priority > highestPriority) {
                        highestPriority = priority
                        highestRole = roleType as UserRole
                    }
                })
            })

            return highestRole
        }
    } catch (e) {
        console.error('getUserRole DB fallback failed:', e)
    }

    return 'operator'
}

/**
 * Resolves an operator's persona from roles.code (e.g. "operator_technician").
 * This is NOT a tier role — personas live only in roles.code, never in the UserRole union.
 * Returns the first code starting with "operator_", or null.
 */
export async function getOperatorPersona(supabase: SupabaseClient, user: User): Promise<string | null> {
    try {
        const { data: memberships } = await supabase
            .from('memberships')
            .select(`
                membership_roles (
                    roles ( code )
                )
            `)
            .eq('user_id', user.id)

        if (memberships && memberships.length > 0) {
            for (const m of memberships) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mRoles = m.membership_roles as any[]
                for (const mr of mRoles ?? []) {
                    const code = mr.roles?.code as string | undefined
                    if (code?.startsWith('operator_')) return code
                }
            }
        }
    } catch (e) {
        console.error('getOperatorPersona DB lookup failed:', e)
    }
    return null
}

export async function getUserPermissions(supabase: SupabaseClient, user: User): Promise<UserPermissions> {
    const role = await getUserRole(supabase, user);

    // Super Admin has all permissions
    if (role === 'super_admin') {
        return {
            can_invite: true,
            can_create_app: true,
            can_view_logs: true
        };
    }

    // Company Admin permissions
    if (role === 'company_admin') {
        return {
            can_invite: true,
            can_create_app: true,
            can_view_logs: false
        };
    }

    // Operators
    return {
        can_invite: false,
        can_create_app: false,
        can_view_logs: false
    };
}

export async function canAccessPath(supabase: SupabaseClient, user: User, pathname: string, providedRole?: UserRole): Promise<boolean> {
    const role = providedRole || await getUserRole(supabase, user);

    // Global access for Super Admin
    if (role === 'super_admin') return true;

    // Common paths that ALL authenticated users can access
    const basePaths = [
        '/profile',
        '/settings',
        '/verify-mfa',
        '/enroll-mfa'
    ];
    
    // Exactly the root dashboard router
    if (pathname === '/dashboard') return true;
    
    // Check if it's a base path
    if (basePaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
        return true;
    }

    // Extract path segments (e.g. /123e4567-e89b-12d3-a456-426614174000/assets -> ['123...', 'assets'])
    const pathSegments = pathname.split('/').filter(Boolean);
    const rootSegment = pathSegments[0];

    // Check if root segment is a UUID (tenant ID). Allow any UUID version (0-9, a-f)
    const isTenantRoute = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rootSegment || '');

    // If it's a Platform route (like /users, /tenants) and user is NOT a super_admin, DENY.
    if (!isTenantRoute) {
        return false;
    }

    // --- TENANT ROUTE VALIDATION ---
    const targetTenantId = rootSegment;

    // 1. Verify User belongs to this Tenant
    // Use admin client to bypass RLS for membership check
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!serviceKey || !url) return false;
    
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js');
    const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: memCheck, error: memErr } = await admin
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('tenant_id', targetTenantId)
        .limit(1)
        .maybeSingle();

    if (memErr || !memCheck) {
        return false;
    }

    // 2. Feature-level access within the tenant based on Role tier
    if (role === 'company_admin') {
        // Company Admin can access everything within their tenant
        return true;
    }

    const featureRoute = pathSegments[1]; // e.g. 'assets' or 'overview'

    // Executive / Auditor — read-only view tiers
    if (role === 'executive_viewer' || role === 'viewer_auditor') {
        const viewerAllowed = ['overview', 'command-center', 'assets', 'fuel-map', 'members', 'sai', 'app-settings'];
        if (viewerAllowed.includes(featureRoute)) return true;
    }

    // Operator access (officer dashboards). Persona split happens in resolveOfficerRedirect.
    if (role === 'operator') {
        const officerAllowed = ['overview', 'assets', 'fuel', 'fuel-map', 'sai', 'app-settings', 'departments', 'members', 'workflow-approval', 'master-data', 'integration-center'];
        if (officerAllowed.includes(featureRoute)) return true;
    }

    // Check for Tenant Admin/Owner role via membership_roles
    // Re-use the existing admin client created above
    const { data: memberships } = await admin
        .from('memberships')
        .select(`
            id,
            membership_roles (
                roles ( code )
            )
        `)
        .eq('user_id', user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasAdminRole = memberships?.some((m: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memRoles = m.membership_roles as any[];
        return memRoles?.some(mr => mr.roles?.code === 'admin_company');
    });

    if (hasAdminRole) {
        return true;
    }

    return false;
}

/**
 * Get the tenant that a user belongs to (for Admin Company/Operator roles)
 * Returns null if user is not a member of any tenant or is super_admin
 */
export async function getUserTenant(supabase: SupabaseClient, userId: string): Promise<{ id: string; name: string } | null> {
    const { data: membership, error } = await supabase
        .from('memberships')
        .select(`
            tenant_id,
            tenants:tenant_id (
                id,
                name
            )
        `)
        .eq('user_id', userId)
        .single();

    if (error || !membership) {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const org = membership.tenants as any;
    return org ? { id: org.id, name: org.name } : null;
}
