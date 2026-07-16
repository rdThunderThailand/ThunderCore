'use client'

import { UserRole } from '@/types/auth'
import { supabase } from '@/utils/supabase/client'
import { getUserRole } from '@/utils/supabase/rbac'
import {
    Activity, AppWindow,
    Building2, ExternalLink, LayoutDashboard, LucideIcon,
    Monitor, Settings, Users, MapPin, ShieldCheck
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from 'react'

export interface MenuItem {
    name: string
    href: string
    icon: LucideIcon
}

export interface OrgOption {
    id: string
    name: string
}

export function useDashboardNav() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const orgContext = searchParams.get('org')

    const [orgName, setOrgName] = useState<string>('')
    const [role, setRole] = useState<UserRole>('operator')
    const [orgs, setOrgs] = useState<OrgOption[]>([])

    // Detect Application Management Context
    const isAppManagement = pathname.startsWith('/app-registry/management/')
    const appId = isAppManagement ? pathname.split('/')[3] : null

    // Detect Tenant Context from URL: /[uuid]/...
    const pathSegments = pathname.split('/')
    const isTenantRoute = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pathSegments[1])
    const tenantId = isTenantRoute ? pathSegments[1] : null
    const isOrgManagement = isTenantRoute

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const fetchedRole = await getUserRole(supabase, user)
                setRole(fetchedRole)
            }
        }
        fetchUserRole()
    }, [])

    // Fetch Tenant Name + all orgs for switcher
    useEffect(() => {
        const fetchOrgDetails = async () => {
            if (isOrgManagement && tenantId) {
                const { data, error } = await supabase
                    .from('tenants')
                    .select('name')
                    .eq('id', tenantId)
                    .single()

                if (data && !error) {
                    setOrgName(data.name)
                }

                // Fetch all orgs for the switcher dropdown
                const { data: allOrgs } = await supabase
                    .from('tenants')
                    .select('id, name')
                    .order('name')

                if (allOrgs) {
                    setOrgs(allOrgs)
                }
            }
        }
        fetchOrgDetails()
    }, [isOrgManagement, tenantId])

    // Menu Sets 
    const superAdminMenu: MenuItem[] = [
        { name: 'Tenants', href: '/tenants', icon: Building2 },
        { name: 'Applications', href: '/app-registry', icon: AppWindow },
        { name: 'Users', href: '/users', icon: Users },
    ]

    const orgAdminMenu: MenuItem[] = tenantId ? [
        { name: 'Dashboard', href: `/${tenantId}/overview`, icon: LayoutDashboard },
        { name: 'Fuel Map', href: `/${tenantId}/fuel-map`, icon: MapPin },
        { name: 'Application', href: `/${tenantId}/app-settings`, icon: Activity },
        { name: 'Members', href: `/${tenantId}/members`, icon: Users },
        { name: 'Privacy Center', href: '/privacy', icon: ShieldCheck },
        { name: 'Settings', href: `/${tenantId}/app-settings`, icon: Settings },
    ] : []

    const applicationMenu: MenuItem[] = [
        { name: 'Dashboard', href: `/app-registry/management/${appId}`, icon: LayoutDashboard },
        { name: 'Application', href: `/app-registry/management/${appId}/portal`, icon: ExternalLink },
        { name: 'Members', href: `/app-registry/management/${appId}/members`, icon: Users },
        { name: 'Settings', href: `/app-registry/management/${appId}/settings`, icon: Settings },
    ]

    const tenantMenu: MenuItem[] = tenantId ? [
        { name: 'Dashboard', href: `/${tenantId}/overview`, icon: LayoutDashboard },
        { name: 'Assets/Device', href: `/${tenantId}/assets`, icon: Monitor },
        { name: 'Fuel Map', href: `/${tenantId}/fuel-map`, icon: MapPin },
        { name: 'Applications', href: `/${tenantId}/app-settings`, icon: AppWindow },
        { name: 'Members', href: `/${tenantId}/members`, icon: Users },
        { name: 'Privacy Center', href: '/privacy', icon: ShieldCheck },
        { name: 'Tenant Settings', href: `/${tenantId}/app-settings`, icon: Settings },
    ] : []

    // Context Logic
    const isSuperAdmin = role === 'super_admin'

    let menuItems = superAdminMenu
    let contextTitle = 'Global Workspace'

    if (isAppManagement) {
        menuItems = applicationMenu
        contextTitle = 'Application Management'
    } else if (isOrgManagement) {
        menuItems = tenantMenu
        contextTitle = orgName || 'Tenant'
    } else if ((isSuperAdmin && orgContext) || role === 'company_admin') {
        menuItems = orgAdminMenu
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        contextTitle = 'Tenant Management'
    }

    return {
        menuItems,
        pathname,
        isSuperAdmin,
        orgContext,
        isAppManagement,
        isOrgManagement,
        orgName,
        orgs,
        tenantId,
        router
    }
}
