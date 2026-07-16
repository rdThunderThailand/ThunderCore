'use server'

import { getAdminClient } from '@/utils/supabase/admin'
import { getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import { SystemApplication } from '@/models/Application'

/**
 * Get all applications across all tenants (Super Admin view)
 */
export async function getAllApplications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // ONLY super_admin can see all applications
    if (role === 'super_admin') {
        // Use singleton admin client for consistent access
        const adminClient = await getAdminClient()

        const { data: applications, error } = await adminClient
            .from('applications')
            .select(`
                *,
                tenants:tenant_id (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching applications - Super Admin:', error)
            throw new Error('Error fetching applications.')
        }

        // Fetch subscription counts separately to avoid relationship issues
        const { data: subscriptions, error: subError } = await adminClient
            .from('organization_applications')
            .select('application_id')

        if (subError) {
            console.error('Error fetching subscriptions:', subError)
        }

        // Count subscriptions per app
        const subCounts = (subscriptions || []).reduce((acc, curr) => {
            acc[curr.application_id] = (acc[curr.application_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return (applications || []).map(app => ({
            ...app,
            tenant_name: app.tenants?.name || 'Unknown',
            org_subscriptions_count: subCounts[app.id] || 0
        })) as SystemApplication[]
    }

    // For everyone else: show apps if they're a member of an org that OWNS the app OR was invited to it
    // First get all tenants the user belongs to
    const { data: memberOrgs } = await supabase
        .from('memberships')
        .select('tenant_id')
        .eq('user_id', user.id)

    if (!memberOrgs || memberOrgs.length === 0) {
        return []
    }

    const userOrgIds = memberOrgs.map(m => m.tenant_id)

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // 1. Get apps that any of user's tenants have been invited to
    const { data: invitedAppIds } = await adminClient
        .from('organization_applications')
        .select('application_id')
        .in('tenant_id', userOrgIds)

    const invitedIds = invitedAppIds?.map(a => a.application_id) || []

    // 2. Fetch the applications (Owned AND Invited) in parallel using Admin Client
    const [ownedAppsRes, invitedAppsRes] = await Promise.all([
        // Fetch Owned Apps
        adminClient
            .from('applications')
            .select(`
                *,
                tenants:tenant_id (
                    id,
                    name
                )
            `)
            .in('tenant_id', userOrgIds)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),

        // Fetch Invited Apps (if any)
        invitedIds.length > 0
            ? adminClient
                .from('applications')
                .select(`
                    *,
                    tenants:tenant_id (
                        id,
                        name
                    )
                `)
                .in('id', invitedIds)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [], error: null })
    ])

    if (ownedAppsRes.error) {
        console.error('Error fetching owned apps:', ownedAppsRes.error)
    }
    if (invitedAppsRes.error) {
        console.error('Error fetching invited apps:', invitedAppsRes.error)
    }

    const ownedApps = ownedAppsRes.data || []
    const invitedApps = invitedAppsRes.data || []

    // Fetch subscription counts for these apps
    const allAppIds = [...ownedApps, ...invitedApps].map(a => a.id);
    let subCounts: Record<string, number> = {};

    if (allAppIds.length > 0) {
        const { data: subscriptions } = await adminClient
            .from('organization_applications')
            .select('application_id')
            .in('application_id', allAppIds)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subCounts = (subscriptions || []).reduce((acc: any, curr: any) => {
            acc[curr.application_id] = (acc[curr.application_id] || 0) + 1;
            return acc;
        }, {});
    }

    // Merge and Deduplicate (just in case)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allAppsMap = new Map<string, any>()

    ownedApps.forEach(app => allAppsMap.set(app.id, { ...app, is_shared: false }))
    invitedApps.forEach(app => {
        if (!allAppsMap.has(app.id)) {
            allAppsMap.set(app.id, { ...app, is_shared: true })
        }
    })

    const combinedApps = Array.from(allAppsMap.values())

    // Sort again as merging might lose order
    combinedApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return combinedApps.map(app => ({
        ...app,
        tenant_name: app.tenants?.name || 'Unknown',
        org_subscriptions_count: subCounts[app.id] || 0
    })) as SystemApplication[]
}

/**
 * Get application statistics
 */
export async function getApplicationStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    if (role !== 'super_admin') {
        throw new Error('Permission denied.')
    }

    const { data: applications, error } = await supabase
        .from('applications')
        .select('id, status, environment, created_at')

    if (error) {
        console.error('Error fetching stats:', error)
        return { total: 0, active: 0, thisMonth: 0 }
    }

    const now = new Date()
    const thisMonth = applications?.filter(app => {
        const created = new Date(app.created_at)
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length || 0

    return {
        total: applications?.length || 0,
        active: applications?.filter(a => a.status === 'active').length || 0,
        thisMonth
    }
}

/**
 * Create a new application (system-wide)
 * Only super_admin can create applications
 * Applications are standalone products that tenants are invited to
 */
export async function createSystemApplication(data: {
    name: string
    description?: string
    environment: 'production' | 'staging' | 'development'
    url?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)
    if (role !== 'super_admin') {
        throw new Error('Permission denied. Only Super Admins can create applications.')
    }

    if (!data.name.trim()) {
        throw new Error('Application name is required.')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { data: application, error } = await adminClient
        .from('applications')
        .insert({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            tenant_id: null, // No owner - applications are standalone
            status: 'active',
            environment: data.environment,
            url: data.url?.trim() || null
        })
        .select('*')
        .single()

    if (error) {
        console.error('Error creating application:', error)
        throw new Error('Failed to create application.')
    }

// [createNotification removed]

    revalidatePath('/dashboard/application')

    return {
        ...application,
        tenant_name: null
    } as SystemApplication
}

/**
 * Create an application owned by a specific tenant.
 * Auth: super_admin (any tenant) OR admin/owner membership of that tenant (company_admin).
 * Sets applications.tenant_id = tenantId and mints an API key (tk_ + 32 random bytes hex).
 */
export async function createTenantApplication(
    tenantId: string,
    data: {
        name: string
        description?: string
        environment: 'production' | 'staging' | 'development'
        url?: string
    }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    if (!tenantId) {
        throw new Error('Tenant is required.')
    }

    // super_admin may create for any tenant; otherwise caller must be admin/owner of this tenant.
    const role = await getUserRole(supabase, user)
    if (role !== 'super_admin') {
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', tenantId)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied. You must be an admin of this tenant to create an application.')
        }
    }

    if (!data.name.trim()) {
        throw new Error('Application name is required.')
    }

    // Same key format as regenerateApiKey so the M2M gate accepts it.
    const { randomBytes } = await import('crypto')
    const apiKey = `tk_${randomBytes(32).toString('hex')}`
    const generatedAt = new Date().toISOString()

    const adminClient = await getAdminClient()

    const { data: application, error } = await adminClient
        .from('applications')
        .insert({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            tenant_id: tenantId, // owner
            status: 'active',
            environment: data.environment,
            url: data.url?.trim() || null,
            api_key: apiKey,
            api_key_generated_at: generatedAt
        })
        .select('*')
        .single()

    if (error) {
        console.error('Error creating tenant application:', error)
        throw new Error('Failed to create application.')
    }

    revalidatePath(`/${tenantId}/app-settings`)
    revalidatePath(`/${tenantId}/overview`)

    return application as SystemApplication
}

/**
 * Delete a system application
 * Super Admin can delete any application
 * Org Admin/Owner can delete applications in their tenant
 */
export async function deleteSystemApplication(applicationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // Get app info first
    const { data: app } = await supabase
        .from('applications')
        .select('name, tenant_id')
        .eq('id', applicationId)
        .single()

    if (!app) {
        throw new Error('Application not found')
    }

    // Check permissions (Super Admin or App Owner Admin)
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
        .eq('application_id', applicationId)

    if (accessError) console.error('Error cleaning up member access:', accessError)

    const { error: inviteError } = await adminClient
        .from('organization_applications')
        .delete()
        .eq('application_id', applicationId)

    if (inviteError) console.error('Error cleaning up invitations:', inviteError)

    // 2. Delete the application
    const { error } = await adminClient
        .from('applications')
        .delete()
        .eq('id', applicationId)

    if (error) {
        console.error('Error deleting application:', error)
        throw new Error('Failed to delete application.')
    }

    // Update app count
    if (app?.tenant_id) {
        await adminClient.rpc('decrement_app_count', { tenant_id: app.tenant_id })
    }

// [createNotification removed]

    revalidatePath('/dashboard/application')

    return { success: true }
}

/**
 * Get all tenants for dropdown
 */
export async function getTenantsForSelect() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('status', 'Active')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching tenants:', error)
        return []
    }

    return tenants || []
}

/**
 * Invite an tenant to use an application
 */
export async function inviteTenantToApp(applicationId: string, tenantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // Check permissions (Super Admin or App Owner)
    if (role !== 'super_admin') {
        const { data: app } = await supabase
            .from('applications')
            .select('tenant_id')
            .eq('id', applicationId)
            .single()

        if (!app) throw new Error('Application not found')

        // Check if user is admin of the owning org
        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied. You must be an admin of the application owner.')
        }
    }

    // Check if valid org
    const { data: org } = await supabase.from('tenants').select('name').eq('id', tenantId).single()
    if (!org) throw new Error('Tenant not found')

    // Use singleton admin client
    const adminClient = await getAdminClient()

    // Create authorization
    const { error } = await adminClient
        .from('organization_applications')
        .insert({
            application_id: applicationId,
            tenant_id: tenantId,
            setting: {}, // Default empty settings
            started_at: new Date().toISOString() // Required by legacy schema
        })

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('Tenant already has access to this application')
        }
        console.error('Error inviting tenant:', error)
        throw new Error('Failed to invite tenant')
    }

    revalidatePath('/dashboard/application')
    revalidatePath(`/dashboard/tenants/management/${tenantId}/applications`)
    return { success: true }
}

/**
 * Revoke application access for an tenant
 */
export async function revokeTenantAccess(applicationId: string, tenantId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // Check permissions (similar logic to invite)
    if (role !== 'super_admin') {
        const { data: app } = await supabase
            .from('applications')
            .select('tenant_id')
            .eq('id', applicationId)
            .single()

        if (!app) throw new Error('Application not found')

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied')
        }
    }

    const { error } = await supabase
        .from('organization_applications')
        .delete()
        .eq('application_id', applicationId)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error revoking access:', error)
        throw new Error('Failed to revoke access')
    }

    revalidatePath('/dashboard/application')
    return { success: true }
}

export async function getAppAuthorizations(applicationId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('organization_applications')
        .select(`
            id,
            tenant_id,
            created_at,
            tenants (name)
        `)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data?.map((d: any) => ({
        id: d.id,
        tenant_id: d.tenant_id,
        tenant_name: d.tenants?.name || 'Unknown',
        created_at: d.created_at
    })) || []
}

/**
 * Update application status
 */
export async function updateApplicationStatus(applicationId: string, newStatus: 'active' | 'inactive' | 'maintenance') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // Check permissions (Super Admin or App Owner Admin)
    if (role !== 'super_admin') {
        const { data: app } = await supabase
            .from('applications')
            .select('tenant_id')
            .eq('id', applicationId)
            .single()

        if (!app) throw new Error('Application not found')

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied')
        }
    }

    const { data: updatedApp, error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId)
        .select()
        .single()

    if (error) {
        console.error('Error updating application status:', error)
        throw new Error('Failed to update status')
    }

    revalidatePath('/dashboard/application')
    return updatedApp
}

/**
 * Update application details
 * Super Admin or App Owner Admin can update
 */
export async function updateSystemApplication(
    applicationId: string,
    data: {
        name: string
        description?: string
        environment: 'production' | 'staging' | 'development'
        url?: string
    }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const role = await getUserRole(supabase, user)

    // Check permissions (Super Admin or App Owner Admin)
    if (role !== 'super_admin') {
        const { data: app } = await supabase
            .from('applications')
            .select('tenant_id')
            .eq('id', applicationId)
            .single()

        if (!app) throw new Error('Application not found')

        const { data: membership } = await supabase
            .from('memberships')
            .select('role')
            .eq('tenant_id', app.tenant_id)
            .eq('user_id', user.id)
            .single()

        if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new Error('Permission denied. You must be an admin to edit this application.')
        }
    }

    if (!data.name.trim()) {
        throw new Error('Application name is required.')
    }

    // Use singleton admin client
    const adminClient = await getAdminClient()

    const { data: updatedApp, error } = await adminClient
        .from('applications')
        .update({
            name: data.name.trim(),
            description: data.description?.trim() || null,
            environment: data.environment,
            url: data.url?.trim() || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select(`
            *,
            tenants:tenant_id (
                id,
                name
            )
        `)
        .single()

    if (error) {
        console.error('Error updating application:', error)
        throw new Error('Failed to update application.')
    }

// [createNotification removed]

    revalidatePath('/dashboard/application')

    return {
        ...updatedApp,
        tenant_name: updatedApp.tenants?.name || null
    } as SystemApplication
}
