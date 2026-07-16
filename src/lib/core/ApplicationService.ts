
import { getAdminClient } from '@/utils/supabase/admin'
import { getUserRole } from '@/utils/supabase/rbac'
import { SupabaseClient } from '@supabase/supabase-js'
import { Application, CreateApplicationDTO, UpdateApplicationDTO } from '@/models/Application'
import { ApplicationRepository } from './ApplicationRepository'

export class ApplicationService {
    private appRepo: ApplicationRepository
    private supabase: SupabaseClient

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase
        this.appRepo = new ApplicationRepository(supabase)
    }

    async getTenantApplications(tenantId: string): Promise<Application[]> {
        const { data: { user } } = await this.supabase.auth.getUser()
        
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        const isSuperAdmin = role === 'super_admin'
        const isSystemAdmin = role === 'company_admin'

        // Check org membership & resolve role via membership_roles → roles
        const { data: membership } = await this.supabase
            .from('memberships')
            .select(`
                id,
                membership_roles(
                    roles(code)
                )
            `)
            .eq('tenant_id', tenantId)
            .eq('user_id', user.id)
            .single()

        const memberRoleCodes = this.extractRoleCodes(membership)
        const isOrgAdmin = memberRoleCodes.includes('admin_company')
        const isOrgMember = !!membership

        if (!isSuperAdmin && !isSystemAdmin && !isOrgMember) {
            throw new Error('You do not have access to this tenant')
        }

        const canSeeAllApps = isSuperAdmin || isSystemAdmin || isOrgAdmin
        const adminClient = await getAdminClient()

        // Fetch invited apps using Admin Client (bypass RLS for lookup)
        const { data: invitedIds } = await adminClient
            .from('organization_applications')
            .select('application_id')
            .eq('tenant_id', tenantId)

        const invitedAppIds = invitedIds?.map(i => i.application_id) || []

        // Use Admin Client for fetching apps to ensure visibility if invited
        const adminAppRepo = new ApplicationRepository(adminClient)

        // 1. Fetch Owned Apps
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const statusFilter = canSeeAllApps ? undefined : 'active'
        const ownedApps = await adminAppRepo.getByTenantId(tenantId, canSeeAllApps ? undefined : 'active')

        // 2. Fetch Invited Apps
        let invitedApps: Application[] = []
        if (invitedAppIds.length > 0) {
            invitedApps = await adminAppRepo.getByIds(invitedAppIds, canSeeAllApps ? undefined : 'active')
        }

        // 3. Merge
        const allApps = [...ownedApps, ...invitedApps]
        const uniqueAppsMap = new Map()
        allApps.forEach(app => uniqueAppsMap.set(app.id, app))
        const uniqueApps = Array.from(uniqueAppsMap.values())

        // Sort
        uniqueApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return uniqueApps.map(app => ({
            ...app,
            tenant_name: app.tenant_id === tenantId ? 'This Tenant' : 'Shared',
            is_shared: app.tenant_id !== tenantId
        })) as Application[]
    }

    async createApplication(data: CreateApplicationDTO): Promise<Application> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        if (role !== 'super_admin' && role !== 'company_admin') {
            throw new Error('Permission denied.')
        }

        if (!data.name.trim()) throw new Error('Application name is required.')

        return this.appRepo.create(data)
    }

    async updateApplication(id: string, data: UpdateApplicationDTO): Promise<Application> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        if (role !== 'super_admin' && role !== 'company_admin') {
            throw new Error('Permission denied.')
        }

        return this.appRepo.update(id, data)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteApplication(id: string, tenantId: string): Promise<void> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        if (role !== 'super_admin' && role !== 'company_admin') {
            throw new Error('Permission denied.')
        }

        // Use admin client for cascading deletes
        const adminClient = await getAdminClient()
        const adminRepo = new ApplicationRepository(adminClient)

        // Manual Cascade (same as before)
        await adminClient.from('member_app_access').delete().eq('application_id', id)
        await adminClient.from('organization_applications').delete().eq('application_id', id)

        await adminRepo.delete(id)
    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getMemberAppAccess(tenantId: string, applicationId: string): Promise<any[]> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        const isSuperAdmin = role === 'super_admin'

        const adminClient = await getAdminClient()

        if (!isSuperAdmin) {
            const { data: membership } = await adminClient
                .from('memberships')
                .select(`
                    id,
                    membership_roles(
                        roles(code)
                    )
                `)
                .eq('tenant_id', tenantId)
                .eq('user_id', user.id)
                .single()

            const callerRoles = this.extractRoleCodes(membership)
            if (!membership || !callerRoles.includes('admin_company')) {
                throw new Error('Permission denied. Only org admins can manage member access.')
            }
        }

        const { data: members, error: membersError } = await adminClient
            .from('memberships')
            .select(`
                user_id,
                membership_roles(
                    roles(code)
                )
            `)
            .eq('tenant_id', tenantId)

        if (membersError) throw new Error('Failed to fetch tenant members')
        if (!members || members.length === 0) return []

        const userIds = members.map(m => m.user_id)
        const { data: profiles } = await adminClient
            .from('users')
            .select('id, first_name, last_name, email')
            .in('id', userIds)

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

        const { data: accessRecords } = await adminClient
            .from('member_app_access')
            .select('user_id, status')
            .eq('tenant_id', tenantId)
            .eq('application_id', applicationId)

        const accessMap = new Map(accessRecords?.map(r => [r.user_id, r.status]) || [])

        return members.map(m => {
            const profile = profileMap.get(m.user_id)
            const roleCodes = this.extractRoleCodes(m)
            return {
                user_id: m.user_id,
                role: roleCodes[0] || 'member',
                first_name: profile?.first_name || '',
                last_name: profile?.last_name || '',
                email: profile?.email || '',
                has_access: accessMap.has(m.user_id),
                access_status: accessMap.get(m.user_id) || null
            }
        })
    }

    async grantMemberAppAccess(tenantId: string, applicationId: string, memberId: string): Promise<void> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        const isSuperAdmin = role === 'super_admin'
        const adminClient = await getAdminClient()

        if (!isSuperAdmin) {
            const { data: membership } = await adminClient
                .from('memberships')
                .select(`
                    id,
                    membership_roles(
                        roles(code)
                    )
                `)
                .eq('tenant_id', tenantId)
                .eq('user_id', user.id)
                .single()

            const callerRoles = this.extractRoleCodes(membership)
            if (!membership || !callerRoles.includes('admin_company')) {
                throw new Error('Permission denied')
            }
        }

        // Check ownership/invitation
        const { data: app } = await adminClient
            .from('applications')
            .select('tenant_id')
            .eq('id', applicationId)
            .single()

        const isOwner = app && app.tenant_id === tenantId

        if (!isOwner) {
            const { data: auth } = await adminClient
                .from('organization_applications')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('application_id', applicationId)
                .single()

            if (!auth) throw new Error('Tenant is not invited to this application')
        }

        const { error } = await adminClient
            .from('member_app_access')
            .upsert({
                tenant_id: tenantId,
                application_id: applicationId,
                user_id: memberId,
                status: 'active',
                created_by: user.id,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'tenant_id,application_id,user_id'
            })

        if (error) throw new Error('Failed to grant access')
    }

    async revokeMemberAppAccess(tenantId: string, applicationId: string, memberId: string): Promise<void> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        const isSuperAdmin = role === 'super_admin'
        const adminClient = await getAdminClient()

        if (!isSuperAdmin) {
            const { data: membership } = await adminClient
                .from('memberships')
                .select(`
                    id,
                    membership_roles(
                        roles(code)
                    )
                `)
                .eq('tenant_id', tenantId)
                .eq('user_id', user.id)
                .single()

            const callerRoles = this.extractRoleCodes(membership)
            if (!membership || !callerRoles.includes('admin_company')) {
                throw new Error('Permission denied')
            }
        }

        const { error } = await adminClient
            .from('member_app_access')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('application_id', applicationId)
            .eq('user_id', memberId)

        if (error) throw new Error('Failed to revoke access')
    }

    async launchApplication(tenantId: string, applicationId: string): Promise<string> {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const role = await getUserRole(this.supabase, user)
        const isSuperAdmin = role === 'super_admin'

        const adminClient = await getAdminClient()

        // App must exist and carry a launch URL.
        const { data: app } = await adminClient
            .from('applications')
            .select('url, name, tenant_id')
            .eq('id', applicationId)
            .single()

        if (!app || !app.url) throw new Error('Application does not have a valid launch URL.')

        // Authorize the launch INTO `tenantId`. super_admin = god mode.
        // Otherwise: caller must be an active member of `tenantId`, AND the app must be
        // owned by (applications.tenant_id) or shared to (organization_applications) that tenant.
        // NOTE: replaces a dead member_app_access query that filtered on non-existent columns.
        if (!isSuperAdmin) {
            const { data: membership } = await this.supabase
                .from('memberships')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('user_id', user.id)
                .single()

            if (!membership) {
                throw new Error('You do not have permission to launch this application.')
            }

            let tenantCanLaunch = app.tenant_id === tenantId // owned
            if (!tenantCanLaunch) {
                const { data: shared } = await adminClient
                    .from('organization_applications')
                    .select('id')
                    .eq('application_id', applicationId)
                    .eq('tenant_id', tenantId)
                    .eq('status', 'active')
                    .maybeSingle()
                tenantCanLaunch = !!shared
            }

            if (!tenantCanLaunch) {
                throw new Error('This application is not available for your tenant.')
            }
        }

        // Canonical launch-token secret is SUPABASE_JWT_SECRET; falls back to
        // SUPABASE_SERVICE_ROLE_KEY only if unset. App layers (e.g. cityzen) must
        // verify with the same value via their own SUPABASE_JWT_SECRET env var.
        const secret = process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!secret) throw new Error('Launch token secret is not configured (set SUPABASE_JWT_SECRET).')
        const encodedSecret = new TextEncoder().encode(secret)

        const { SignJWT } = await import('jose')

        const jwt = await new SignJWT({
            sub: user.id,
            email: user.email,
            tenant_id: tenantId,
            app_id: applicationId,
            app_name: app.name,
            role: role,
            aud: 'authenticated',
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1m')
            .sign(encodedSecret)

        const launchUrl = new URL(app.url)
        launchUrl.searchParams.append('token', jwt)

        return launchUrl.toString()
    }

    /**
     * Extract role codes from a membership record that includes
     * membership_roles(roles(code)) in its select.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extractRoleCodes(membership: any): string[] {
        if (!membership?.membership_roles || !Array.isArray(membership.membership_roles)) {
            return []
        }
        return membership.membership_roles
            .map((mr: { roles?: { code?: string } }) => mr.roles?.code)
            .filter(Boolean) as string[]
    }
}
