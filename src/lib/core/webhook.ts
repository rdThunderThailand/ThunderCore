import { getAdminClient } from '@/utils/supabase/admin'

export type MembershipEvent = 'membership.created' | 'membership.updated' | 'membership.revoked'
export type OrgEvent = 'org.created' | 'org.updated'

type AdminClient = Awaited<ReturnType<typeof getAdminClient>>

async function resolveTenantAppUrls(admin: AdminClient, tenantId: string): Promise<string[]> {
    const { data: ownedApps } = await admin
        .from('applications')
        .select('url')
        .eq('tenant_id', tenantId)

    const { data: orgApps } = await admin
        .from('organization_applications')
        .select('application_id')
        .eq('tenant_id', tenantId)

    let invitedAppUrls: { url: string | null }[] = []
    if (orgApps && orgApps.length > 0) {
        const appIds = orgApps.map(a => a.application_id)
        const { data: invitedAppsData } = await admin
            .from('applications')
            .select('url')
            .in('id', appIds)
        invitedAppUrls = invitedAppsData || []
    }

    const urls = [
        ...(ownedApps || []),
        ...invitedAppUrls
    ]
        .map(a => a.url)
        .filter((url): url is string => Boolean(url))

    return Array.from(new Set(urls))
}

async function resolveUserAppUrls(admin: AdminClient, userId: string): Promise<string[]> {
    const { data } = await admin
        .from('memberships')
        .select('tenant_id')
        .eq('user_id', userId)
        .in('status', ['invited', 'active'])

    if (!data || data.length === 0) return []

    const tenantIds = Array.from(new Set(data.map(m => m.tenant_id).filter(Boolean)))
    
    const allUrls: string[] = []
    for (const tid of tenantIds) {
        if (!tid) continue
        const tUrls = await resolveTenantAppUrls(admin, tid)
        allUrls.push(...tUrls)
    }
    
    return Array.from(new Set(allUrls))
}

async function signAndFanOut(urls: string[], claims: Record<string, unknown>): Promise<void> {
    if (urls.length === 0) return

    const secret = process.env.WEBHOOK_SECRET
    if (!secret) {
        console.warn('[webhook] WEBHOOK_SECRET not set, skipping')
        return
    }

    const { SignJWT } = await import('jose')
    const jwt = await new SignJWT(claims)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(new TextEncoder().encode(secret))

    const sendOne = async (url: string) => {
        let targetUrl = ''
        try {
            targetUrl = new URL('/api/webhooks/thunder', url).toString()
        } catch (err) {
            console.error(`[webhook] Invalid url: ${url}`, err)
            return
        }

        let attempt = 0
        while (attempt < 3) {
            try {
                const res = await fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + jwt,
                        'Content-Type': 'application/json'
                    },
                    body: '{}'
                })
                if (res.ok) {
                    return
                }
            } catch (err) {
            }
            attempt++
            if (attempt < 3) {
                await new Promise(r => setTimeout(r, 300 * attempt))
            }
        }
        console.error(`[webhook] target failed after 3 attempts: ${targetUrl}`)
    }

    await Promise.allSettled(urls.map(sendOne))
}

export async function emitMembershipEvent(
    event: MembershipEvent,
    tenantId: string,
    userId: string,
): Promise<void> {
    try {
        const admin = await getAdminClient()
        const urls = await resolveTenantAppUrls(admin, tenantId)
        if (urls.length === 0) return

        const claims: Record<string, unknown> = { event, tenant_id: tenantId, user_id: userId, occurred_at: new Date().toISOString() }

        if (event !== 'membership.revoked') {
            const [{ data: membership }, { data: user }, { data: tenant }] = await Promise.all([
                admin.from('memberships').select('status, membership_roles(roles(code, name))').eq('tenant_id', tenantId).eq('user_id', userId).single(),
                admin.from('users').select('email, first_name, last_name, display_name, avatar_url').eq('id', userId).single(),
                admin.from('tenants').select('name').eq('id', tenantId).single()
            ])

            if (membership) {
                claims.status = membership.status
                type RoleRef = { code: string | null; name: string | null }
                type MembershipRole = { roles: RoleRef | RoleRef[] | null }
                const rolesData = (membership.membership_roles ?? []) as MembershipRole[]
                const flatRoles = rolesData.flatMap((mr) =>
                    Array.isArray(mr.roles) ? mr.roles : mr.roles ? [mr.roles] : [])
                claims.role_codes = flatRoles
                    .map((r) => r.code)
                    .filter((c): c is string => Boolean(c))
                const roleLabels = flatRoles
                    .map((r) => r.name)
                    .filter((n): n is string => Boolean(n))
                if (roleLabels.length > 0) {
                    claims.role_label = roleLabels[0]
                }
            }

            if (user) {
                const displayName = user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.email || userId
                claims.display_name = displayName
                if (user.email != null) claims.email = user.email
                if (user.avatar_url != null) claims.avatar_url = user.avatar_url
            } else {
                claims.display_name = userId
            }

            if (tenant?.name != null) {
                claims.tenant_name = tenant.name
            }
        }

        await signAndFanOut(urls, claims)
    } catch (err) {
        console.error('[webhook] emit failed', err)
    }
}

export async function emitUserEvent(userId: string): Promise<void> {
    try {
        const admin = await getAdminClient()
        const urls = await resolveUserAppUrls(admin, userId)
        if (urls.length === 0) return

        const { data: user } = await admin.from('users').select('email, first_name, last_name, display_name, avatar_url').eq('id', userId).single()
        
        let displayName = userId
        let email: string | null = null
        let avatar_url: string | null = null
        if (user) {
            displayName = user.display_name || [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.email || userId
            email = user.email
            avatar_url = user.avatar_url
        }

        const claims: Record<string, unknown> = {
            event: 'user.updated',
            user_id: userId,
            occurred_at: new Date().toISOString(),
            display_name: displayName,
        }
        if (email != null) claims.email = email
        if (avatar_url != null) claims.avatar_url = avatar_url

        await signAndFanOut(urls, claims)
    } catch (err) {
        console.error('[webhook] emit failed', err)
    }
}

export async function emitOrgEvent(
    event: OrgEvent,
    tenantId: string,
    dept: { id: string; name: string; name_en?: string | null; code?: string | null; department_type?: string | null; status?: string | null }
): Promise<void> {
    try {
        const admin = await getAdminClient()
        const urls = await resolveTenantAppUrls(admin, tenantId)
        if (urls.length === 0) return

        const claims: Record<string, unknown> = {
            event,
            org_id: dept.id,
            tenant_id: tenantId,
            occurred_at: new Date().toISOString(),
            name: dept.name || dept.id
        }

        if (dept.department_type != null) {
            claims.org_type = dept.department_type
        }
        const abbrev = dept.name_en ?? dept.code
        if (abbrev != null && abbrev !== '') {
            claims.abbreviation = abbrev
        }
        if (dept.status != null) {
            claims.status = dept.status
        }

        await signAndFanOut(urls, claims)
    } catch (err) {
        console.error('[webhook] emit failed', err)
    }
}
