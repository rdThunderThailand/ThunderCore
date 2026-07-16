'use server'

import { getAdminClient } from '@/utils/supabase/admin'
import { getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    getTenantApplications as fetchOrgApps,
    revokeMemberAppAccess as removeMemberAppAccess
} from '../applications/actions'

import { GetMembersOptions, Membership } from '@/types/members'

/**
 * Get all members of an tenant
 */
export async function getMemberships(tenantId: string, options?: GetMembersOptions): Promise<{ data: Membership[], count: number }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // Handle search by finding matching profiles first
    let userIdsWithSearch: string[] | null = null

    if (options?.search) {
        const { data: searchedProfiles } = await adminClient
            .from('users')
            .select('id')
            .or(`email.ilike.%${options.search}%,first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%`)

        userIdsWithSearch = (searchedProfiles || []).map(p => p.id)

        // If a search was provided but no profiles matched, return empty result
        if (userIdsWithSearch.length === 0) {
            return { data: [], count: 0 }
        }
    }

    // First get the members with pagination
    let query = adminClient
        .from('memberships')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('joined_at', { ascending: false })

    if (userIdsWithSearch) {
        query = query.in('user_id', userIdsWithSearch)
    }

    if (options?.page && options.limit) {
        const from = (options.page - 1) * options.limit
        const to = from + options.limit - 1
        query = query.range(from, to)
    }

    const { data: members, error, count } = await query

    if (error) {
        console.error('Error fetching members:', error)
        return { data: [], count: 0 }
    }

    if (!members || members.length === 0) {
        return { data: [], count: count || 0 }
    }

    // Get user IDs to fetch profiles
    const userIds = members.map(m => m.user_id)

    // Fetch profiles for these users
    const { data: profiles } = await adminClient
        .from('users')
        .select('id, email, first_name, last_name')
        .in('id', userIds)

    // Create a map of profiles
    const profileMap = new Map()
    if (profiles) {
        profiles.forEach(p => profileMap.set(p.id, p))
    }

    const mergedData = members.map(member => {
        const profile = profileMap.get(member.user_id)
        return {
            id: member.id,
            user_id: member.user_id,
            tenant_id: member.tenant_id,
            role: member.role,
            joined_at: member.joined_at,
            user: profile ? {
                id: profile.id,
                email: profile.email,
                full_name: profile.first_name
                    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
                    : profile.email,
                avatar_url: undefined
            } : {
                id: member.user_id,
                email: 'Unknown',
                full_name: 'Unknown User',
                avatar_url: undefined
            }
        }
    }) as Membership[]

    return { data: mergedData, count: count || 0 }
}

/**
 * Add a member to an tenant
 */
/**
 * Add a member to an tenant
 */
export async function addMembership(data: {
    tenantId: string
    email: string
    role: 'admin' | 'member'
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const currentRole = await getUserRole(supabase, user)
    if (currentRole !== 'super_admin' && currentRole !== 'company_admin') {
        throw new Error('Permission denied.')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // Find user by email - search auth.users directly (source of truth)
    // This avoids issues with orphaned profiles that don't have a real auth account
    const { data: authUserData, error: authLookupError } = await adminClient
        .rpc('get_auth_user_by_email', { lookup_email: data.email.toLowerCase().trim() })

    let authUser = authUserData?.[0] || null

    // Fallback: if RPC doesn't exist yet, try profiles lookup + auth verification
    if (authLookupError?.code === '42883') {
        // RPC doesn't exist - fall back to profiles lookup with auth verification
        const { data: profileLookup } = await adminClient
            .from('users')
            .select('id')
            .eq('email', data.email.toLowerCase().trim())
            .single()

        if (profileLookup) {
            const { data: { user: verifiedUser } } = await adminClient.auth.admin.getUserById(profileLookup.id)
            if (verifiedUser) {
                authUser = { id: verifiedUser.id, email: verifiedUser.email }
            }
        }
    }

    if (!authUser) {
        // Auto-invite: create auth account for this email
        const { data: { user: invitedUser }, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
            data.email.toLowerCase().trim(),
            {
                data: {
                    first_name: '',
                    last_name: '',
                    is_active: true,
                    onboarding_status: 'pending'
                }
            }
        )

        if (inviteError || !invitedUser) {
            console.error('Error inviting user:', inviteError)
            throw new Error(inviteError?.message || 'Failed to invite user. Please try again.')
        }

        authUser = { id: invitedUser.id, email: invitedUser.email }
    }

    const userId = authUser.id

    // Get profile data for display name
    const { data: targetProfile } = await adminClient
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('id', userId)
        .single()

    const fullName = targetProfile?.first_name
        ? `${targetProfile.first_name} ${targetProfile.last_name || ''}`.trim()
        : authUser.email || data.email

    // Ensure user exists in public.users table (FK requirement)
    const { data: existingUser } = await adminClient
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

    if (!existingUser) {
        const { error: createUserError } = await adminClient
            .from('users')
            .insert({
                id: userId,
                email: authUser.email,
                role: 'operator',
                can_invite: false,
                can_create_app: false,
                can_view_logs: false
            })

        if (createUserError) {
            console.error('Error creating user record:', createUserError)
            throw new Error('Failed to prepare user record. Please try again.')
        }
    }

    // Ensure user exists in profiles table
    if (!targetProfile) {
        await adminClient
            .from('users')
            .insert({
                id: userId,
                email: authUser.email,
                first_name: '',
                last_name: '',
                is_active: true,
                onboarding_status: 'pending'
            })
    }

    // Check if already a member OF THIS tenant
    const { data: existingInThisOrg } = await adminClient
        .from('memberships')
        .select('id')
        .eq('tenant_id', data.tenantId)
        .eq('user_id', userId)
        .single()

    if (existingInThisOrg) {
        throw new Error('User is already a member of this tenant.')
    }

    // Check if user is already a member of ANY tenant (single org rule)
    const { data: existingInAnyOrg } = await adminClient
        .from('memberships')
        .select('id, tenant_id')
        .eq('user_id', userId)
        .single()

    if (existingInAnyOrg) {
        // Get the org name for better error message
        const { data: otherOrg } = await adminClient
            .from('tenants')
            .select('name')
            .eq('id', existingInAnyOrg.tenant_id)
            .single()

        throw new Error(`User already belongs to "${otherOrg?.name || 'another tenant'}". Each user can only belong to one tenant.`)
    }

    // Add member
    const { data: member, error } = await adminClient
        .from('memberships')
        .insert({
            tenant_id: data.tenantId,
            user_id: userId,
            role: data.role,
            joined_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding member:', error)
        // Show actual error for debugging
        if (error.code === '42P01') {
            throw new Error('Tenant members table does not exist. Please run the SQL migration.')
        }
        if (error.code === '23503') {
            throw new Error('User or tenant not found.')
        }
        throw new Error(error.message || 'Failed to add member. Please try again.')
    }

    // Update member count
    await adminClient.rpc('increment_member_count', { tenant_id: data.tenantId })

// [createNotification removed]

    revalidatePath(`/dashboard/tenants/management/${data.tenantId}/members`)

    return {
        ...member,
        user: targetProfile
    }
}

/**
 * Remove a member from an tenant
 */
export async function removeMembership(memberId: string, tenantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const currentRole = await getUserRole(supabase, user)
    if (currentRole !== 'super_admin' && currentRole !== 'company_admin') {
        throw new Error('Permission denied.')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // Get member info before deleting
    const { data: member } = await adminClient
        .from('memberships')
        .select('*')
        .eq('id', memberId)
        .single()

    if (member) {
        // Fetch profile separately
        const { data: profile } = await adminClient
            .from('users')
            .select('first_name, last_name, email')
            .eq('id', member.user_id)
            .single()

        if (profile) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (member as any).profiles = profile
        }
    }

    // Cannot remove owner
    if (member?.role === 'owner') {
        throw new Error('Cannot remove the tenant owner.')
    }

    const { error } = await adminClient
        .from('memberships')
        .delete()
        .eq('id', memberId)

    if (error) {
        console.error('Error removing member:', error)
        throw new Error('Failed to remove member. Please try again.')
    }

    // Update member count
    await adminClient.rpc('decrement_member_count', { tenant_id: tenantId })

    const memberName = member?.profiles?.first_name
        ? `${member.profiles.first_name} ${member.profiles.last_name || ''}`.trim()
        : member?.profiles?.email || 'Member'

// [createNotification removed]

    revalidatePath(`/dashboard/tenants/management/${tenantId}/members`)

    return { success: true }
}

/**
 * Update member role
 */
export async function updateMemberRole(memberId: string, tenantId: string, newRole: 'admin' | 'member') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const currentRole = await getUserRole(supabase, user)
    if (currentRole !== 'super_admin' && currentRole !== 'company_admin') {
        throw new Error('Permission denied.')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { data: member, error } = await adminClient
        .from('memberships')
        .update({ role: newRole })
        .eq('id', memberId)
        .select()
        .single()

    if (error) {
        console.error('Error updating member role:', error)
        throw new Error('Failed to update member role.')
    }

    revalidatePath(`/dashboard/tenants/management/${tenantId}/members`)

    return member
}

/**
 * Get details for a specific member
 */
export async function getMemberDetails(memberId: string, tenantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Role check
    const currentRole = await getUserRole(supabase, user)
    if (currentRole !== 'super_admin' && currentRole !== 'company_admin') {
        // Allow members to view their own profile? Maybe. stricter for now.
        // Actually if I am an admin I can view others.
    }
    // We can reuse the admin check logic or just rely on RLS if we weren't using adminClient everywhere.
    // For consistency let's use adminClient to fetch exact details including profile.

    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { data: member, error } = await adminClient
        .from('memberships')
        .select('*')
        .eq('id', memberId)
        .eq('tenant_id', tenantId)
        .single()

    if (error || !member) {
        throw new Error('Member not found')
    }

    // Fetch profile
    const { data: profile } = await adminClient
        .from('users')
        .select('*')
        .eq('id', member.user_id)
        .single()

    // If no profile record, try to get email from auth.users as fallback
    let profileData = profile
    if (!profile) {
        try {
            const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(member.user_id)
            if (authUser) {
                profileData = {
                    id: member.user_id,
                    first_name: authUser.user_metadata?.first_name || '',
                    last_name: authUser.user_metadata?.last_name || '',
                    email: authUser.email || ''
                }
            }
        } catch (e) {
            console.error('Error fetching auth user fallback:', e)
        }
    }

    return {
        ...member,
        profiles: profileData
    }
}


/**
 * Update member profile details
 */
export async function updateMemberProfile(userId: string, data: { first_name: string; last_name: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const adminClient = await getAdminClient()

    // Check if profile record exists
    const { data: existingProfile } = await adminClient
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

    let error

    if (existingProfile) {
        // Profile exists — standard update
        const result = await adminClient
            .from('users')
            .update({ first_name: data.first_name, last_name: data.last_name })
            .eq('id', userId)
        error = result.error
    } else {
        // Profile doesn't exist — fetch email from auth.users and create full profile
        let email = ''
        try {
            const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(userId)
            email = authUser?.email || ''
        } catch (e) {
            console.error('Error fetching auth user for profile creation:', e)
        }

        const result = await adminClient
            .from('users')
            .insert({
                id: userId,
                first_name: data.first_name,
                last_name: data.last_name,
                email: email,
                role: 'operator',
                is_active: true,
                is_super_admin: false,
                is_mfa_enabled: false,
                are_marketing_emails_enabled: false,
                default_tenant_id: null,
                onboarding_status: 'completed'
            })
        error = result.error
    }

    if (error) {
        console.error('Error updating profile:', error)
        throw new Error('Failed to update profile')
    }

    revalidatePath('/dashboard/tenants/management/[id]/members/[memberId]/settings', 'page')
    return { success: true }
}








/**
 * Get applications assigned to a member (via member_app_access)
 */
export async function getMemberApplications(tenantId: string, memberId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // Get the user_id from memberId
    const { data: member } = await adminClient
        .from('memberships')
        .select('user_id')
        .eq('id', memberId)
        .single()

    if (!member) return []

    // Fetch applications from member_app_access
    const { data: accessRecords, error } = await adminClient
        .from('member_app_access')
        .select(`
            application_id,
            status,
            applications:application_id (
                id,
                name,
                created_at,
                tenant_id,
                status
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('user_id', member.user_id)
        .eq('status', 'active')

    if (error) {
        console.error('Error fetching member applications:', error)
        return []
    }

    // Transform to flat application objects
    return accessRecords
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.map((record: any) => record.applications)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((app: any) => app) // filter nulls
        || []
}

/**
 * Remove an application access from a member
 */
export async function removeApplicationFromMember(tenantId: string, memberId: string, applicationId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const supabase = await createClient()

    // We need to resolve the memberId (org_member_id) to a user_id
    // This mapping logic is repeated, ideally could be a helper but inline is fine for now
    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { data: member } = await adminClient
        .from('memberships')
        .select('user_id')
        .eq('id', memberId)
        .single()

    if (!member) throw new Error('Member not found')

    const result = await removeMemberAppAccess(tenantId, applicationId, member.user_id)
    revalidatePath(`/dashboard/tenants/management/${tenantId}/members/${memberId}/settings`)
    return result
}
export async function getTenantApplications(tenantId: string) {
    return fetchOrgApps(tenantId)
}

/**
 * Assign an application to a member (Grant Access)
 */
export async function assignApplicationToMember(tenantId: string, memberId: string, applicationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Role check
    const currentRole = await getUserRole(supabase, user)
    if (currentRole !== 'super_admin' && currentRole !== 'company_admin') {
        throw new Error('Permission denied')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // Get user_id from memberId
    const { data: member } = await adminClient
        .from('memberships')
        .select('user_id')
        .eq('id', memberId)
        .single()

    if (!member) throw new Error('Member not found')

    // Grant access (Upsert to member_app_access)
    const { error } = await adminClient
        .from('member_app_access')
        .upsert({
            tenant_id: tenantId,
            application_id: applicationId,
            user_id: member.user_id,
            status: 'active',
            created_by: user.id,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'tenant_id,application_id,user_id'
        })

    if (error) {
        console.error('Error assigning application (granting access):', error)
        throw new Error('Failed to assign application')
    }

    revalidatePath('/dashboard/tenants/management/[id]/members/[memberId]/settings', 'page')
    return { success: true }
}
