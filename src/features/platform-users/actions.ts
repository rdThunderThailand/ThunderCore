'use server'

import { Profile } from '@/types'
import { getUserTenant, getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { emitUserEvent } from '@/lib/core/webhook'

export interface GetProfilesOptions {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export async function getProfiles(options?: GetProfilesOptions): Promise<{ data: Profile[], count: number }> {
    const supabase = await createClient()

    // Get current user and role
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Unauthorized')

    const role = await getUserRole(supabase, currentUser)
    const isSuperAdmin = role === 'super_admin'

    // For Org Admins, get their tenant and filter users
    let orgMemberIds: string[] = []
    let currentTenantId: string | null = null
    if (!isSuperAdmin) {
        const org = await getUserTenant(supabase, currentUser.id)
        if (!org) {
            // User has no tenant - return empty
            return { data: [], count: 0 }
        }
        currentTenantId = org.id

        // Get all user IDs in this tenant
        const { data: orgMembers } = await supabase
            .from('memberships')
            .select('user_id')
            .eq('tenant_id', org.id)

        orgMemberIds = (orgMembers || []).map(m => m.user_id)

        if (orgMemberIds.length === 0) {
            return { data: [], count: 0 }
        }
    }

    // 1. Fetch profiles (with pagination and search)
    let profilesQuery = supabase.from('users').select('*', { count: 'exact' })

    if (!isSuperAdmin && orgMemberIds.length > 0) {
        profilesQuery = profilesQuery.in('id', orgMemberIds)
    }

    if (options?.search) {
        profilesQuery = profilesQuery.or(`email.ilike.%${options.search}%,first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%`)
    }

    if (options?.sortBy) {
        profilesQuery = profilesQuery.order(options.sortBy, { ascending: options.sortDirection === 'asc', nullsFirst: false })
    } else {
        profilesQuery = profilesQuery.order('created_at', { ascending: false })
    }

    if (options?.page && options.limit) {
        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        profilesQuery = profilesQuery.range(from, to)
    }

    const { data: profiles, error: profilesError, count } = await profilesQuery

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return { data: [], count: 0 }
    }

    const profileIds = (profiles || []).map(p => p.id)
    if (profileIds.length === 0) {
        return { data: [], count: count || 0 }
    }

    // 2. Fetch users' global fields for the fetched profiles
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, is_super_admin, is_active')
        .in('id', profileIds)

    if (usersError) {
        console.error('Error fetching users:', usersError)
        throw new Error('Failed to fetch users')
    }

    // Fetch dynamic roles from memberships since we dropped 'role' from public.users
    const userRoleMap = new Map<string, string>()
    try {
        let roleQuery = supabase
            .from('memberships')
            .select(`
                user_id,
                membership_roles (
                    roles ( role_type )
                )
            `)
            .in('user_id', profileIds)
        
        if (currentTenantId) {
            roleQuery = roleQuery.eq('tenant_id', currentTenantId)
        }

        const { data: userMemberships } = await roleQuery
        if (userMemberships) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            userMemberships.forEach((m: any) => {
                let highestRole = 'operator'
                let highestPriority = 0
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rolesData = (m.membership_roles as any[]) || []
                
                rolesData.forEach(mr => {
                    const roleType = mr.roles?.role_type as string
                    const priority = roleType === 'super_admin' ? 100 : roleType === 'company_admin' ? 50 : 10
                    if (priority > highestPriority) {
                        highestPriority = priority
                        highestRole = roleType
                    }
                })

                const currentHighest = userRoleMap.get(m.user_id)
                const currentPriority = currentHighest === 'super_admin' ? 100 : currentHighest === 'company_admin' ? 50 : 10
                
                if (!currentHighest || highestPriority > currentPriority) {
                    userRoleMap.set(m.user_id, highestRole)
                }
            })
        }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        console.error('Error fetching membership roles for profiles')
    }

    // 3. Manually join the data
    const userMap = new Map((users || []).map(u => [u.id, u]))

    const merged = (profiles || []).map(profile => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u: any = userMap.get(profile.id) || {}
        
        const isUserSuperAdmin = !!u.is_super_admin
        const calculatedRole = isUserSuperAdmin ? 'super_admin' : (userRoleMap.get(profile.id) || 'operator')

        return {
            ...profile,
            ...u,
            id: profile.id,
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            is_active: profile.is_active ?? true, // Default to true if missing
            role: calculatedRole
        }
    }) as Profile[]

    return { data: merged, count: count || 0 }
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { first_name, last_name, is_active, ...userUpdates } = updates as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileUpdates: any = {}
    if (first_name !== undefined) profileUpdates.first_name = first_name
    if (last_name !== undefined) profileUpdates.last_name = last_name
    if (is_active !== undefined) profileUpdates.is_active = is_active

    // We no longer update 'role' directly on public.users since it was dropped in Migration 006.
    // Instead, role is managed via membership_roles for tenants, and is_super_admin for global admins.
    if (Object.keys(userUpdates).length > 0) {
        // Safe check: ignore 'role' if present
        delete userUpdates.id
        const roleFromUpdates = userUpdates.role // save before deleting
        delete userUpdates.role

        if (Object.keys(userUpdates).length > 0) {
            // Use service role for user table updates (RLS may block regular client)
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            if (!serviceRoleKey || !supabaseUrl) throw new Error('Server configuration error: Missing credentials')
            
            const supabaseAdmin = createSupabaseClient(
                supabaseUrl,
                serviceRoleKey,
                { auth: { autoRefreshToken: false, persistSession: false } }
            )
            const { error: userError } = await supabaseAdmin
                .from('users')
                .update(userUpdates)
                .eq('id', id)
            if (userError) {
                console.error('Error updating users table:', userError)
                throw new Error(userError.message)
            }

            // ── Sync role to auth.users app_metadata ──
            // Determines the new role from is_super_admin flag or explicit role update
            let newAppMetaRole: string | null = null
            if (userUpdates.is_super_admin === true || roleFromUpdates === 'super_admin') {
                newAppMetaRole = 'super_admin'
            } else if (userUpdates.is_super_admin === false) {
                // Demoted from super_admin — fall back to operator (memberships govern the rest)
                newAppMetaRole = 'operator'
            } else if (roleFromUpdates) {
                newAppMetaRole = roleFromUpdates
            }

            if (newAppMetaRole) {
                const { error: metaRoleError } = await supabaseAdmin.auth.admin.updateUserById(id, {
                    app_metadata: { role: newAppMetaRole }
                })
                if (metaRoleError) {
                    console.error('Failed to sync app_metadata.role:', metaRoleError)
                } else {
                    console.log(`Synced app_metadata.role = '${newAppMetaRole}' for user ${id}`)
                }
            }
        }
    }

    // Update 'profiles' table if there are name changes
    if (Object.keys(profileUpdates).length > 0) {
        // 1. Fetch target user's email from 'users' table
        let email = null;
        const { data: targetUser } = await supabase
            .from('users')
            .select('email')
            .eq('id', id)
            .single()

        email = targetUser?.email;

        // Fallback: If public.users has no email, use Service Role to fetch from auth.users
        if (!email) {
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (serviceRoleKey && supabaseUrl) {
                const supabaseAdmin = createSupabaseClient(
                    supabaseUrl,
                    serviceRoleKey,
                    { auth: { autoRefreshToken: false, persistSession: false } }
                );
                const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);
                if (authUser) {
                    email = authUser.email;
                } else if (authError) {
                    console.error('Failed to fetch email from auth.admin:', authError);
                }
            } else {
                console.error('SUPABASE_SERVICE_ROLE_KEY is missing!');
            }
        }

        // 2. Fetch existing profile to preserve state (is_active, is_super_admin, default_tenant_id)
        const { data: existingProfile } = await supabase
            .from('users')
            .select('is_active, is_super_admin, default_tenant_id')
            .eq('id', id)
            .single()

        // Default Logic:
        // - If profile exists: Preserve existing values (unless overridden by updates)
        // - If NEW profile: Default is_active to FALSE (Pending Approval), is_super_admin to FALSE
        const defaultIsActive = existingProfile ? existingProfile.is_active : false
        const defaultIsSuperAdmin = existingProfile ? existingProfile.is_super_admin : false

        // Fix potential FK violation: Verify default_tenant_id exists
        let defaultOrgId = existingProfile?.default_tenant_id || null
        if (defaultOrgId) {
            // Check if tenant actually exists using admin client logic is safest, but standard client works if RLS fits.
            // Using admin client here for safety since we are already in a sensitive update flow.
            // Re-using supabaseAdmin if available, or fetch fresh.
            // Actually, we can just use the 'supabase' client which accesses public.tenants.
            // If the org is deleted, it won't be returned even to admin? 
            // Wait, standard client is constrained by RLS. If user is NOT a member of the org, they might not see it.
            // But if it's their "default", they SHOULD be a member.
            // Let's use supabaseAdmin to be 100% sure we are checking existence effectively.
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (serviceRoleKey && supabaseUrl) {
                const adminCheck = createSupabaseClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
                const { count } = await adminCheck
                    .from('tenants')
                    .select('id', { count: 'exact', head: true })
                    .eq('id', defaultOrgId)

                if (count === 0) {
                    defaultOrgId = null // Tenant doesn't exist, clear the reference
                    console.warn(`Clearing invalid default_tenant_id ${defaultOrgId} for user ${id}`)
                }
            }
        }

        // Only add email to board payload if we found it, otherwise let DB error/handle it
        const upsertPayload = {
            id: id,
            onboarding_status: 'completed',
            are_marketing_emails_enabled: false,
            is_mfa_enabled: false,
            // Preserve existing or use defaults
            is_active: defaultIsActive,
            is_super_admin: defaultIsSuperAdmin,
            default_tenant_id: defaultOrgId, // Explicitly set validated/sanitized ID
            ...(email ? { email: email } : {}),
            ...profileUpdates // Override defaults with actual updates
        }

        // Use service role for profile updates to bypass RLS
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Server configuration error: Missing credentials')
        }

        const supabaseAdmin = createSupabaseClient(
            supabaseUrl,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { error: profileError } = await supabaseAdmin
            .from('users')
            .upsert(upsertPayload) // Use upsert to create if missing
            .select()

        if (profileError) {
            console.error('Error updating profiles table:', profileError)
            throw new Error(profileError.message)
        }

        // Sync to Auth Metadata (for Middleware Optimization)
        // Reuse the admin client created above

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metadataUpdates: any = {}
        if (profileUpdates.first_name !== undefined) metadataUpdates.first_name = profileUpdates.first_name
        if (profileUpdates.last_name !== undefined) metadataUpdates.last_name = profileUpdates.last_name
        if (profileUpdates.is_active !== undefined) metadataUpdates.is_active = profileUpdates.is_active

        // If we have updates, sync them
        if (Object.keys(metadataUpdates).length > 0) {
            const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(id, {
                user_metadata: metadataUpdates
            })
            if (metaError) {
                console.error('Error syncing user metadata:', metaError)
            }
        }
    }

    // Notification Logic
    if (updates.is_active !== undefined) {
// [createNotification removed]
    }

    if (updates.role) {
// [createNotification removed]
    }

    await emitUserEvent(id)

    revalidatePath('/dashboard/users')
}

export async function deleteUser(id: string) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey) {
        throw new Error('Server configuration error: Missing service role key')
    }

    if (!supabaseUrl) {
        throw new Error('Server configuration error: Missing Supabase URL')
    }

    const supabaseAdmin = createSupabaseClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) {
        console.error('Error deleting user:', error)
        throw new Error(error.message)
    }

// [createNotification removed]

    revalidatePath('/dashboard/users')
}

export async function debugUserStatus(id: string) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
        return { error: 'Missing required environment variables' }
    }

    const supabaseAdmin = createSupabaseClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
    return { profile, error }
}

export async function createUser(data: {
    email: string
    first_name?: string
    last_name?: string
    role: string
}) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
        throw new Error('Server configuration error: Missing credentials')
    }

    const supabaseAdmin = createSupabaseClient(
        supabaseUrl,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Use empty strings as defaults for names (user will complete profile later)
    const firstName = data.first_name || ''
    const lastName = data.last_name || ''

    // 1. Create the Auth User (Invite)
    // Using inviteUserByEmail is better as it handles email verification flow properly
    // and allows user to set their own password.
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: {
            first_name: firstName,
            last_name: lastName,
            is_active: true, // Auto-activate invited users
            onboarding_status: firstName && lastName ? 'completed' : 'pending'
        }
    })

    if (authError) {
        console.error('Error creating auth user:', authError)
        throw new Error(authError.message)
    }

    if (!user) throw new Error('Failed to create user')

    // 2. Insert into 'users' table
    const { error: userTableError } = await supabaseAdmin
        .from('users')
        .insert({
            id: user.id,
            email: data.email,
            role: data.role,
            can_invite: data.role === 'super_admin' || data.role === 'company_admin',
            can_create_app: data.role === 'super_admin' || data.role === 'company_admin',
            can_view_logs: data.role === 'super_admin'
        })

    if (userTableError) {
        console.error('Error inserting into users table:', userTableError)
        // Cleanup: delete auth user if DB insertion fails
        await supabaseAdmin.auth.admin.deleteUser(user.id)
        throw new Error(userTableError.message)
    }

    // 3. Insert into 'profiles' table
    const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: data.email,
            is_active: true,
            is_super_admin: data.role === 'super_admin',
            onboarding_status: firstName && lastName ? 'completed' : 'pending'
        })

    if (profileError) {
        console.error('Error inserting into profiles table:', profileError)
    }

// [createNotification removed]

    revalidatePath('/dashboard/users')
    return { id: user.id }
}

export async function checkUserMfaStatus(userId: string): Promise<boolean> {
    const supabase = await createClient()

    // 1. Verify caller has permission to view this user
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Unauthorized')

    const role = await getUserRole(supabase, currentUser)
    const isSuperAdmin = role === 'super_admin'

    if (!isSuperAdmin) {
        // Check if caller and target user share an tenant
        const orgInfo = await getUserTenant(supabase, currentUser.id)
        if (!orgInfo) throw new Error('Unauthorized')

        const { data: sharesOrg } = await supabase
            .from('memberships')
            .select('user_id')
            .eq('tenant_id', orgInfo.id)
            .eq('user_id', userId)
            .single()

        if (!sharesOrg) throw new Error('Unauthorized')
    }

    // 2. Fetch MFA status from Admin API
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const { data, error } = await supabaseAdmin.auth.admin.mfa.listFactors({
            userId: userId
        })

        if (error) {
            console.error('Error fetching MFA status:', error)
            return false
        }

        // Check if any factor is verified
        return data.factors.some(factor => factor.status === 'verified')
    } catch (e) {
        console.error('Error in checkUserMfaStatus:', e)
        return false
    }
}

/**
 * Set a user's role — updates BOTH public.users AND auth.users app_metadata
 * so getUserRole() returns the correct value immediately after next login.
 * Supported roles: 'super_admin', 'company_admin', 'operator'
 */
export async function setUserRole(targetUserId: string, newRole: string): Promise<{ success: boolean; error?: string }> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceRoleKey || !supabaseUrl) {
        return { success: false, error: 'Server configuration error: Missing credentials' }
    }

    // Verify caller is super_admin
    const supabase = await createClient()
    const { data: { user: caller } } = await supabase.auth.getUser()
    if (!caller) return { success: false, error: 'Unauthorized' }
    const callerRole = await getUserRole(supabase, caller)
    if (callerRole !== 'super_admin') return { success: false, error: 'Forbidden: super_admin only' }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    const isSuperAdmin = newRole === 'super_admin'

    // 1. Update public.users
    const { error: dbError } = await supabaseAdmin
        .from('users')
        .update({ is_super_admin: isSuperAdmin })
        .eq('id', targetUserId)

    if (dbError) {
        console.error('setUserRole: DB update failed', dbError)
        return { success: false, error: dbError.message }
    }

    // 2. Sync to auth.users app_metadata so JWT reflects the new role immediately
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        app_metadata: { role: newRole }
    })

    if (authError) {
        console.error('setUserRole: auth metadata sync failed', authError)
        return { success: false, error: authError.message }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}
