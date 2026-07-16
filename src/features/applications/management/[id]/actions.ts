'use server'

import { getAdminClient } from '@/utils/supabase/admin'
import { getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import { ApplicationDetails, ScenarioLevel, ScenarioMetadata } from '@/models/Application'
import { ApplicationLog } from '@/models/Log'

/**
 * Get application details by ID
 */
export async function getApplicationById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data: application, error } = await supabase
        .from('applications')
        .select(`
            *,
            tenants:tenant_id (
                id,
                name
            )
        `)
        .eq('id', id)
        .single()

    if (error || !application) {
        console.error('Error fetching application:', error)
        return null
    }

    return {
        ...application,
        tenant_name: application.tenants?.name || 'Unknown'
    } as ApplicationDetails
}

/**
 * Update application details
 * Super Admin can update any application
 * Org Admin/Owner can update applications in their tenant
 */
export async function updateApplication(id: string, data: {
    name?: string
    description?: string
    url?: string
    status?: 'active' | 'inactive' | 'maintenance'
    environment?: 'production' | 'staging' | 'development'
    custom_domain?: string | null
    branding_color?: string
    logo_url?: string | null
    portal_title?: string | null
    portal_description?: string | null
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // Get app info first to check org ownership
    const { data: app } = await supabase
        .from('applications')
        .select('tenant_id')
        .eq('id', id)
        .single()

    if (!app) {
        throw new Error('Application not found')
    }

    // Check permissions (Super Admin or App Owner Admin/Owner)
    if (role !== 'super_admin') {
        if (!app.tenant_id) {
            throw new Error('Permission denied. Only Super Admins can update system applications.')
        }

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied. You must be an admin of the tenant to update this application.')
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { updated_at: new Date().toISOString() }
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.url !== undefined) updateData.url = data.url.trim()
    if (data.status !== undefined) updateData.status = data.status
    if (data.environment !== undefined) updateData.environment = data.environment
    if (data.custom_domain !== undefined) updateData.custom_domain = data.custom_domain?.trim() || null
    if (data.branding_color !== undefined) updateData.branding_color = data.branding_color
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url?.trim() || null
    if (data.portal_title !== undefined) updateData.portal_title = data.portal_title?.trim() || null
    if (data.portal_description !== undefined) updateData.portal_description = data.portal_description?.trim() || null

    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { data: application, error } = await adminClient
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating application:', error)
        throw new Error('Failed to update application.')
    }

    revalidatePath(`/dashboard/application/management/${id}`)

    return application as ApplicationDetails
}

/**
 * Get application members (tenants that have access)
 */
/**
 * Get application members (tenants that have access)
 */
export async function getApplicationTenants(appId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // 1. Get the owning tenant
    const { data: app } = await supabase
        .from('applications')
        .select('tenant_id, tenants:tenant_id(id, name, created_at)')
        .eq('id', appId)
        .single()

    // Cast the joined tenant data properly (Supabase returns single object for singular FK)
    const orgData = app?.tenants as unknown as { id: string; name: string; created_at: string } | null
    const ownerOrg = orgData ? [{
        id: orgData.id,
        name: orgData.name,
        joinedAt: orgData.created_at,
        isOwner: true
    }] : []


    // 2. Get authorized tenants using admin client to bypass potential RLS visibility issues for the list
    // Use service role client to bypass RLS
    // Hack: Check for misconfigured keys
    let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey || serviceRoleKey.startsWith('sb_secret')) {
        serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
    let authorizations = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let authorizedOrgs: any[] = [];

    if (serviceRoleKey && supabaseUrl) {
        const adminClient = await getAdminClient()

        // 1. Fetch relations (Manual Join Part 1)
        const { data: relations, error: relError } = await adminClient
            .from('organization_applications')
            .select('tenant_id, created_at, started_at, ended_at')
            .eq('application_id', appId)

        if (relError) {
            console.error('Error fetching authorizations:', relError);
        } else if (relations && relations.length > 0) {
            // 2. Fetch Tenants (Manual Join Part 2)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tenantIds = relations.map((r: any) => r.tenant_id);
            const { data: orgs } = await adminClient
                .from('tenants')
                .select('id, name')
                .in('id', tenantIds)

            // Map together
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orgMap = new Map(orgs?.map((o: any) => [o.id, o]));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authorizedOrgs = relations.map((r: any) => {
                const org = orgMap.get(r.tenant_id);
                return {
                    id: r.tenant_id,
                    name: org?.name || 'Unknown',
                    joinedAt: r.started_at || r.created_at,
                    expiredAt: r.ended_at,
                    isOwner: false
                }
            });
        }
    } else {
        // Fallback to user client (Manual Join)
        const { data: relations, error: relError } = await supabase
            .from('organization_applications')
            .select('tenant_id, created_at')
            .eq('application_id', appId)

        if (relError) {
            console.error('[Debug] User Client Error:', relError);
        } else if (relations && relations.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tenantIds = relations.map((r: any) => r.tenant_id);
            const { data: orgs } = await supabase
                .from('tenants')
                .select('id, name')
                .in('id', tenantIds)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orgMap = new Map(orgs?.map((o: any) => [o.id, o]));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            authorizedOrgs = relations.map((r: any) => {
                const org = orgMap.get(r.tenant_id);
                return {
                    id: r.tenant_id,
                    name: org?.name || 'Unknown',
                    joinedAt: r.created_at,
                    isOwner: false
                }
            });
        }
    }

    // Combine and deduplicate by ID to prevent UI errors
    const allOrgs = [...ownerOrg, ...authorizedOrgs];
    const uniqueOrgs = Array.from(new Map(allOrgs.map(item => [item.id, item])).values());

    return uniqueOrgs;
}

/**
 * Add an tenant to the application access list
 * Super Admin can add to any application
 * Org Admin/Owner can add to applications in their tenant
 */
export async function addApplicationAuthorization(appId: string, tenantId: string, startDate?: string | null, endDate?: string | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const role = await getUserRole(supabase, user)

    // Get app info first to check org ownership
    const { data: app } = await supabase
        .from('applications')
        .select('tenant_id')
        .eq('id', appId)
        .single()

    if (!app) {
        throw new Error('Application not found')
    }

    // Check permissions (Super Admin or App Owner Admin/Owner)
    if (role !== 'super_admin') {
        if (!app.tenant_id) {
            throw new Error('Permission denied. Only Super Admins can manage system applications.')
        }

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied. You must be an admin of the tenant.')
        }
    }


    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { error } = await adminClient
        .from('organization_applications')
        .insert({
            application_id: appId,
            tenant_id: tenantId,
            started_at: startDate ? new Date(startDate).toISOString() : undefined,
            ended_at: endDate ? new Date(endDate).toISOString() : undefined,
            setting: {}
        })

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('Tenant already has access.')
        }
        console.error('Error adding authorization:', error)
        throw new Error('Failed to add tenant access: ' + error.message)
    }

    revalidatePath(`/dashboard/application/management/${appId}`)
    return { success: true }
}

/**
 * Remove an tenant from the application access list
 * Super Admin can remove from any application
 * Org Admin/Owner can remove from applications in their tenant
 */
export async function removeApplicationAuthorization(appId: string, tenantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const role = await getUserRole(supabase, user)

    // Get app info first to check org ownership
    const { data: app } = await supabase
        .from('applications')
        .select('tenant_id')
        .eq('id', appId)
        .single()

    if (!app) {
        throw new Error('Application not found')
    }

    // Check permissions (Super Admin or App Owner Admin/Owner)
    if (role !== 'super_admin') {
        if (!app.tenant_id) {
            throw new Error('Permission denied. Only Super Admins can manage system applications.')
        }

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied. You must be an admin of the tenant.')
        }
    }


    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { error } = await adminClient
        .from('organization_applications')
        .delete()
        .eq('application_id', appId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error removing authorization:', error)
        throw new Error('Failed to remove tenant access.')
    }

    revalidatePath(`/dashboard/application/management/${appId}`)
    return { success: true }
}

/**
 * Get application activity logs
 */
export async function getApplicationLogs(appId: string, limit = 10) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // First get the app to check its tenant
    const { data: app } = await supabase
        .from('applications')
        .select('tenant_id')
        .eq('id', appId)
        .single()

    if (!app) return []

    // Build the query filter - handle null tenant_id for standalone apps
    let filterQuery = `target.eq.application_${appId}`
    if (app.tenant_id) {
        filterQuery += `,tenant_id.eq.${app.tenant_id}`
    }

    // Get logs related to this application
    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .or(filterQuery)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching logs:', error)
        return []
    }

    return (logs || []).map(log => ({
        id: log.id,
        action: log.action,
        status: log.status,
        created_at: log.created_at,
        user_email: log.user_email
    })) as ApplicationLog[]
}

/**
 * Get application statistics
 */
export async function getApplicationStats(appId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // Get the app's tenant (to identify owner)
    const { data: app } = await adminClient
        .from('applications')
        .select('tenant_id')
        .eq('id', appId)
        .single()

    if (!app) {
        return { totalMembers: 0, logsToday: 0, activeOrgs: 1 }
    }

    // 1. Identify all authorized tenants (Owner + Invited)
    const { data: invitedOrgs } = await adminClient
        .from('organization_applications')
        .select('tenant_id')
        .eq('application_id', appId)

    const tenantIds = new Set<string>()
    if (app.tenant_id) tenantIds.add(app.tenant_id)
    invitedOrgs?.forEach(i => tenantIds.add(i.tenant_id))

    const targetOrgIds = Array.from(tenantIds)

    // 2. Count Unique Members across these tenants
    let totalMembers = 0
    if (targetOrgIds.length > 0) {
        const { data: members } = await adminClient
            .from('memberships')
            .select('user_id')
            .in('tenant_id', targetOrgIds)

        const uniqueUsers = new Set(members?.map(m => m.user_id))
        totalMembers = uniqueUsers.size
    }

    // 3. Active Orgs Count
    const activeOrgs = targetOrgIds.length || 1

    // 4. Count logs today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: logsToday } = await adminClient
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

    return {
        totalMembers,
        logsToday: logsToday || 0,
        activeOrgs
    }
}

/**
 * Delete application
 * Super Admin can delete any application
 * Org Admin/Owner can delete applications in their tenant
 */
export async function deleteApplicationById(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // Get app info for count update and permission check
    const { data: app } = await supabase
        .from('applications')
        .select('tenant_id')
        .eq('id', id)
        .single()

    if (!app) {
        throw new Error('Application not found')
    }

    // Check permissions (Super Admin or App Owner Admin/Owner)
    if (role !== 'super_admin') {
        if (!app.tenant_id) {
            throw new Error('Permission denied. Only Super Admins can delete system applications.')
        }

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied. You must be an admin of the tenant to delete this application.')
        }
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // 1. Delete related records (Manual Cascade)
    const { error: accessError } = await adminClient
        .from('member_app_access')
        .delete()
        .eq('application_id', id)

    if (accessError) console.error('Error cleaning up member access:', accessError)

    const { error: inviteError } = await adminClient
        .from('organization_applications')
        .delete()
        .eq('application_id', id)

    if (inviteError) console.error('Error cleaning up invitations:', inviteError)

    // 2. Delete the application
    const { error } = await adminClient
        .from('applications')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting application:', error)
        throw new Error('Failed to delete application.')
    }

    // Update count
    if (app?.tenant_id) {
        await adminClient.rpc('decrement_app_count', { tenant_id: app.tenant_id })
    }

    revalidatePath('/dashboard/application')

    return { success: true }
}


/**
 * Get existing API key for an application
 */
export async function getApiKey(appId: string): Promise<{ api_key: string | null, api_key_generated_at: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const adminClient = await getAdminClient()
    const { data, error } = await adminClient
        .from('applications')
        .select('api_key, api_key_generated_at')
        .eq('id', appId)
        .single()

    if (error) throw new Error(error.message)
    return { api_key: data?.api_key ?? null, api_key_generated_at: data?.api_key_generated_at ?? null }
}

/**
 * Generate (or Regenerate) API Key for an Application — saves to DB
 */
export async function regenerateApiKey(appId: string): Promise<{ api_key: string, api_key_generated_at: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const role = await getUserRole(supabase, user)
    if (role !== 'super_admin') {
        throw new Error('Permission denied. Only Super Admins can generate API keys.')
    }

    // Generate a 64-char hex key with tk_ prefix
    const { randomBytes } = await import('crypto')
    const newKey = `tk_${randomBytes(32).toString('hex')}`
    const generatedAt = new Date().toISOString()

    const adminClient = await getAdminClient()
    const { data, error } = await adminClient
        .from('applications')
        .update({ api_key: newKey, api_key_generated_at: generatedAt, updated_at: generatedAt })
        .eq('id', appId)
        .select('api_key, api_key_generated_at')
        .single()

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/application/management/${appId}/settings`)
    return { api_key: data.api_key, api_key_generated_at: data.api_key_generated_at }
}

/**
 * Get application members across all authorized tenants
 */
export async function getApplicationMembers(appId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // 1. Get Authorized Orgs (Reusing logic or calling simple query)
    // We need logic similar to getApplicationTenants but using adminClient to be safe
    // But getApplicationTenants uses user client. 
    // Let's just fetch IDs directly using adminClient for speed/reliability.

    // Get Owner Org
    const { data: app } = await adminClient
        .from('applications')
        .select('tenant_id')
        .eq('id', appId)
        .single()

    // Get Invited Orgs
    const { data: invited } = await adminClient
        .from('organization_applications')
        .select('tenant_id')
        .eq('application_id', appId)

    const tenantIds = new Set<string>()
    if (app?.tenant_id) tenantIds.add(app.tenant_id)
    invited?.forEach(i => tenantIds.add(i.tenant_id))

    const targetOrgIds = Array.from(tenantIds)

    if (targetOrgIds.length === 0) return []

    // 2. Fetch Members from these Orgs
    const { data: orgMembers, error: membersError } = await adminClient
        .from('memberships')
        .select('id, user_id, role, tenant_id, tenants(name)')
        .in('tenant_id', targetOrgIds)

    if (membersError) {
        console.error('Error fetching app members:', membersError)
        return []
    }

    if (!orgMembers || orgMembers.length === 0) return []

    // 3. Fetch Profiles for these members
    const userIds = orgMembers.map(m => m.user_id)
    const { data: profiles } = await adminClient
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // 4. Map to return format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return orgMembers.map((m: any) => {
        const profile = profileMap.get(m.user_id)
        return {
            id: m.id,
            user_id: m.user_id, // Keep for reference
            name: profile?.first_name
                ? `${profile.first_name} ${profile.last_name || ''}`
                : 'Unknown User',
            email: profile?.email || 'No email',
            role: m.role === 'owner' ? 'Admin' : m.role === 'admin' ? 'Developer' : 'Viewer',
            status: 'Active',
            tenantName: m.tenants?.name || 'Unknown'
        }
    })
}

// ==============================================================================
// SCENARIO CONTROL
// ==============================================================================

/**
 * Get current scenario level for an application
 * Public-ish: any authenticated user with app access can read it
 */
export async function getApplicationScenario(appId: string): Promise<{
    scenario_level: ScenarioLevel
    scenario_metadata: ScenarioMetadata
    scenario_updated_at: string | null
}> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const adminClient = await getAdminClient()
    const { data, error } = await adminClient
        .from('applications')
        .select('scenario_level, scenario_metadata, scenario_updated_at')
        .eq('id', appId)
        .single()

    if (error || !data) throw new Error('Application not found')

    return {
        scenario_level: (data.scenario_level as ScenarioLevel) || 'normal',
        scenario_metadata: (data.scenario_metadata as ScenarioMetadata) || {},
        scenario_updated_at: data.scenario_updated_at,
    }
}

/**
 * Update application scenario level
 * Restricted to super_admin only
 */
export async function updateApplicationScenario(
    appId: string,
    level: ScenarioLevel,
    metadata?: ScenarioMetadata
): Promise<{ scenario_level: ScenarioLevel; scenario_updated_at: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const role = await getUserRole(supabase, user)
    if (role !== 'super_admin') {
        throw new Error('Permission denied. Only Super Admins can change scenario levels.')
    }

    const validLevels: ScenarioLevel[] = ['normal', 'watch', 'crisis', 'lockdown']
    if (!validLevels.includes(level)) {
        throw new Error(`Invalid scenario level: ${level}`)
    }

    const adminClient = await getAdminClient()
    const now = new Date().toISOString()

    // Get current level for history log
    const { data: current } = await adminClient
        .from('applications')
        .select('scenario_level')
        .eq('id', appId)
        .single()

    // Update application scenario
    const { data, error } = await adminClient
        .from('applications')
        .update({
            scenario_level: level,
            scenario_metadata: metadata ?? {},
            scenario_updated_at: now,
            updated_at: now,
        })
        .eq('id', appId)
        .select('scenario_level, scenario_updated_at')
        .single()

    if (error || !data) throw new Error('Failed to update scenario level')

    // Log to history
    await adminClient
        .from('application_scenario_logs')
        .insert({
            application_id: appId,
            previous_level: current?.scenario_level || 'normal',
            new_level: level,
            metadata: metadata ?? {},
            changed_by: user.id,
            changed_at: now,
        })

    revalidatePath(`/dashboard/application/management/${appId}`)

    return {
        scenario_level: data.scenario_level as ScenarioLevel,
        scenario_updated_at: data.scenario_updated_at,
    }
}
