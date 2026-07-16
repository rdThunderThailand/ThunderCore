'use server'

import { CreateTenantSchema, UpdateTenantSchema } from '@/lib/validations'
import { Tenant, TenantStatus, TenantType } from '@/types'
import { AppError, validateInput, validateUUID } from '@/utils/errors'
import { getAdminClient } from '@/utils/supabase/admin'
import { getUserRole } from '@/utils/supabase/rbac'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTenants() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const role = await getUserRole(supabase, user)

    if (role !== 'super_admin') {
        throw new Error('Permission denied. Only Super Admins can view all tenants.')
    }

    const adminClient = await getAdminClient()

    const { data: tenants, error } = await adminClient
        .from('tenants')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching tenants:', error)
        throw new Error('Error fetching data. Please try again later.')
    }

    if (!tenants || tenants.length === 0) return []

    const tenantIds = tenants.map(o => o.id)

    const { data: memberCounts, error: memberError } = await adminClient
        .from('memberships')
        .select('tenant_id')
        .in('tenant_id', tenantIds)

    if (memberError) console.error('Error counting members:', memberError)

    const memberCountMap = new Map<string, number>()
    const appCountMap = new Map<string, number>()

    memberCounts?.forEach(m => {
        memberCountMap.set(m.tenant_id, (memberCountMap.get(m.tenant_id) || 0) + 1)
    })

    const { data: invitedCounts, error: invitedError } = await adminClient
        .from('organization_applications')
        .select('tenant_id')
        .in('tenant_id', tenantIds)

    if (invitedError) console.error('Error counting apps:', invitedError)

    invitedCounts?.forEach(i => {
        appCountMap.set(i.tenant_id, (appCountMap.get(i.tenant_id) || 0) + 1)
    })

    return tenants.map(org => ({
        id: org.id,
        name: org.name,
        type: (org.tenant_type ?? org.type) as TenantType,
        memberCount: memberCountMap.get(org.id) || 0,
        appCount: appCountMap.get(org.id) || 0,
        deviceQuota: org.device_quota || 50,
        deviceCount: 0,
        status: org.status as TenantStatus,
        createdAt: org.created_at || new Date().toISOString()
    })) as Tenant[]
}

export async function getTenantById(id: string) {
    validateUUID(id, 'Tenant ID')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw AppError.unauthorized()

    await getUserRole(supabase, user)

    const adminClient = await getAdminClient()

    const { data: tenant, error } = await adminClient
        .from('tenants')
        .select('*, contact_email, website_url, description')
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') throw AppError.notFound('Tenant')
        console.error('Error fetching tenant:', error)
        throw AppError.internalError('Error fetching data. Please try again later.')
    }

    const [{ count: mCount }, { count: aCount }] = await Promise.all([
        adminClient.from('memberships').select('*', { count: 'exact', head: true }).eq('tenant_id', id),
        adminClient.from('organization_applications').select('*', { count: 'exact', head: true }).eq('tenant_id', id)
    ])

    return {
        id: tenant.id,
        name: tenant.name,
        type: (tenant.tenant_type ?? tenant.type) as TenantType,
        memberCount: mCount || 0,
        appCount: aCount || 0,
        deviceQuota: tenant.device_quota || 50,
        deviceCount: 0,
        status: tenant.status as TenantStatus,
        contactEmail: tenant.contact_email || null,
        websiteUrl: tenant.website_url || null,
        description: tenant.description || null,
    } as Tenant
}

export async function createTenant(data: {
    name: string
    type: TenantType
    status?: TenantStatus
}) {
    const validatedData = validateInput(CreateTenantSchema, data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw AppError.unauthorized()

    const role = await getUserRole(supabase, user)

    if (role !== 'super_admin') {
        throw AppError.forbidden('Only Super Admins can create tenants.')
    }

    // ✅ ใช้ adminClient bypass RLS ทั้งหมด
    const adminClient = await getAdminClient()

    const { data: existing } = await adminClient
        .from('tenants')
        .select('id')
        .eq('name', validatedData.name)
        .single()

    if (existing) throw AppError.duplicate('Tenant name')

const { data: tenant, error } = await adminClient
    .from('tenants')
    .insert({
        name: validatedData.name,
        tenant_code: validatedData.name
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '_')
            .slice(0, 20) + '_' + Date.now().toString().slice(-4),
        tenant_type: validatedData.type,
        status: validatedData.status,
    })
    .select()
    .single()

    if (error) {
        if (error.code === '23505') throw AppError.duplicate('Tenant name')
        console.error('Error creating tenant:', error)
        throw AppError.internalError('Unable to create tenant. Please try again later.')
    }

    revalidatePath('/dashboard/tenants')

    return {
        id: tenant.id,
        name: tenant.name,
        type: (tenant.tenant_type ?? tenant.type) as TenantType,
        memberCount: 0,
        appCount: 0,
        deviceQuota: tenant.device_quota || 50,
        deviceCount: 0,
        status: tenant.status as TenantStatus,
    } as Tenant
}

export async function updateTenant(
    id: string,
    data: {
        name?: string
        type?: TenantType
        status?: TenantStatus
        contact_email?: string | null
        website_url?: string | null
        description?: string | null
    }
) {
    validateUUID(id, 'Tenant ID')
    const validatedData = validateInput(UpdateTenantSchema, data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw AppError.unauthorized()

    const role = await getUserRole(supabase, user)

    if (role !== 'super_admin' && role !== 'company_admin') {
        throw AppError.forbidden('You do not have permission to edit tenants.')
    }

    // ✅ ใช้ adminClient bypass RLS
    const adminClient = await getAdminClient()

    if (validatedData.name) {
        const { data: existing } = await adminClient
            .from('tenants')
            .select('id')
            .eq('name', validatedData.name)
            .neq('id', id)
            .single()

        if (existing) throw AppError.duplicate('Tenant name')
    }

    const updateData: Record<string, unknown> = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.type !== undefined) updateData.tenant_type = validatedData.type
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.contact_email !== undefined) updateData.contact_email = validatedData.contact_email
    if (validatedData.website_url !== undefined) updateData.website_url = validatedData.website_url
    if (validatedData.description !== undefined) updateData.description = validatedData.description

    const { data: tenant, error } = await adminClient
        .from('tenants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        if (error.code === 'PGRST116') throw AppError.notFound('Tenant')
        if (error.code === '23505') throw AppError.duplicate('Tenant name')
        console.error('Error updating tenant:', error)
        throw AppError.internalError('Update failed. Please try again later.')
    }

    revalidatePath('/dashboard/tenants')
    revalidatePath(`/dashboard/tenants/management/${id}`)

    return {
        id: tenant.id,
        name: tenant.name,
        type: (tenant.tenant_type ?? tenant.type) as TenantType,
        memberCount: 0,
        appCount: 0,
        deviceQuota: tenant.device_quota || 50,
        deviceCount: 0,
        status: tenant.status as TenantStatus,
    } as Tenant
}

export async function deleteTenant(id: string) {
    validateUUID(id, 'Tenant ID')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw AppError.unauthorized()

    const role = await getUserRole(supabase, user)

    if (role !== 'super_admin') {
        throw AppError.forbidden('Only Super Admins can delete tenants.')
    }

    // ✅ ใช้ adminClient bypass RLS
    const adminClient = await getAdminClient()

    const { data: tenantData, error: fetchError } = await adminClient
        .from('tenants')
        .select('name')
        .eq('id', id)
        .single()

    if (fetchError || !tenantData) throw AppError.notFound('Tenant')

    const [{ count: mCount }, { count: aCount }] = await Promise.all([
        adminClient.from('memberships').select('*', { count: 'exact', head: true }).eq('tenant_id', id),
        adminClient.from('organization_applications').select('*', { count: 'exact', head: true }).eq('tenant_id', id)
    ])

    if ((mCount || 0) > 0 || (aCount || 0) > 0) {
        throw AppError.badRequest('Cannot delete tenant with active dependencies. Please remove all members and applications first.')
    }

    const { error } = await adminClient
        .from('tenants')
        .delete()
        .eq('id', id)

    if (error) {
        if (error.code === '23503') throw AppError.badRequest('Cannot delete tenant with active dependencies.')
        console.error('Error deleting tenant:', error)
        throw AppError.internalError('An error occurred. Please contact support.')
    }

    revalidatePath('/dashboard/tenants')
    return { success: true }
}

export async function getTenantUsageStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw AppError.unauthorized()

    const role = await getUserRole(supabase, user)

    if (role !== 'super_admin') {
        throw AppError.forbidden('Only Super Admins can view usage statistics.')
    }

    const adminClient = await getAdminClient()

    const { data: tenants, error } = await adminClient
        .from('tenants')
        .select('id, name, status, created_at')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching usage stats:', error)
        throw AppError.internalError('Error fetching data. Please try again later.')
    }

    if (!tenants || tenants.length === 0) {
        return {
            tenants: [],
            totalTenants: 0,
            totalMembers: 0,
            totalApps: 0,
            activeTenants: 0,
        }
    }

    const [{ data: memberships }, { data: appAuthorizations }] = await Promise.all([
        adminClient.from('memberships').select('tenant_id'),
        adminClient.from('organization_applications').select('tenant_id')
    ])

    const memberMap = new Map<string, number>()
    const appMap = new Map<string, number>()

    memberships?.forEach(m => memberMap.set(m.tenant_id, (memberMap.get(m.tenant_id) || 0) + 1))
    appAuthorizations?.forEach(a => appMap.set(a.tenant_id, (appMap.get(a.tenant_id) || 0) + 1))

    const totalMembers = memberships?.length || 0
    const totalApps = appAuthorizations?.length || 0
    const activeTenants = tenants.filter(org => org.status === 'active').length

    return {
        tenants: tenants.map(org => ({
            id: org.id,
            name: org.name,
            memberCount: memberMap.get(org.id) || 0,
            appCount: appMap.get(org.id) || 0,
            status: org.status as TenantStatus,
            createdAt: org.created_at,
        })),
        totalTenants: tenants.length,
        totalMembers,
        totalApps,
        activeTenants,
    }
}